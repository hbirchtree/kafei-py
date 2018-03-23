#!/usr/bin/python3

import logging
from logging.handlers import RotatingFileHandler
from apscheduler.schedulers.background import BackgroundScheduler as Scheduler
from flask import Flask, jsonify, redirect, url_for, request, make_response, Response
from os import environ as ENV
import ssl
import psycopg2
import atexit
from typing import Tuple, Dict, List, Any
from time import time
from base64 import b64decode as mysteryfun
from functools import wraps
from os.path import dirname
from strap import create_app, bootstrap
from math import ceil
import sys
import traceback

# Flask server
app = create_app(__name__)

KAFEI_SIGNATURE = 'Kafei/'

try:
    with open('%s/VERSION' % dirname(__file__)) as f:
        KAFEI_SIGNATURE = KAFEI_SIGNATURE + f.read().decode()
except FileNotFoundError:
    KAFEI_SIGNATURE = KAFEI_SIGNATURE + '0.1'

# Create DB connection
try:
    conn = psycopg2.connect("dbname='postgres' user='postgres' host='%s' password='%s'" % (ENV['DBHOST'], ENV['DBPASS']))
except:
    print("Unable to connect to database")
    exit(1)


def database_commit():
    print("-- Committing to database")
    conn.commit()


class timestamp():
    def __init__(self, timeval):
        self.value = str(timeval)

    def __str__(self):
        return self.value

class Sequelizer():
    def __init__(self):
        self.cur_table = None
        self.field_mappings = {}
        self.kfield_mappings = {}
        self.blobs = {}
        self.primary_keys = {}
        self.table_links = []
        pass

    def table(self, table_name: str, prim_key: str):
        self.field_mappings[table_name] = []
        self.kfield_mappings[table_name] = []
        self.blobs[table_name] = []
        self.primary_keys[table_name] = prim_key
        self.cur_table = table_name
        return self

    def field(self,
              field_name: str, var_name: str,
              default: Any='', var_type: Any=str,
              fmt: str = '%s'):
        f = (field_name, var_name, default, var_type, fmt)
        self.field_mappings[self.cur_table].append(f)
        return self

    def keyfield(self,
                 field_name: str, table_ref: str, fmt: str = '%s'):
        f = (field_name, table_ref, fmt)
        self.kfield_mappings[self.cur_table].append(f)
        return self

    def blobfield(self, field_name: str):
        self.blobs[self.cur_table].append((field_name,))
        return self

    # t1 = tuple(str, str)
    def link(self,
             t1: Tuple[str, str],
             t2: Tuple[str, str],
             tu: str):
        self.table_links.append((t1, t2, tu))
        return self
        
    def get_fmt_opt(self, table, field):
        fm = [f[4] for f in self.field_mappings[table] if f[0] == field]
        if len(fm) > 0:
            return fm[0]
        fm = [f[2] for f in self.kfield_mappings[table] if f[0] == field]
        if len(fm) > 0:
            return fm[0]
        return '%s'

    def gen_query(self, table: str, fields):
        q = "INSERT INTO " + table + " "
        q = q + "("
        for f in fields:
            q = q + f[0] + ","
        if len(fields) > 0:
            q = q[:-1]
        q = q + ") VALUES("
        for f in fields:
            try:
                q = q + f[1] + ","
            except IndexError:
                q = q + self.get_fmt_opt(table, f[0]) + ","
        if len(fields) > 0:
            q = q[:-1]
        if type(self.primary_keys[table]) == str:
            q = q + ")"\
                " ON CONFLICT DO NOTHING" +\
                " RETURNING " +\
                self.primary_keys[table]
        else:
            q = q + ")"\
                " ON CONFLICT DO NOTHING"
        return q

    def gen_query_n(self, table, fields, i):
        a = []
        for f in fields:
            things = []
            for ii in i:
                things.append(f[ii])
            a.append(things)
        return self.gen_query(table, a)

    def pivot_arguments(self, table, lfields, data, pre):
        if not lfields:
            return [pre]
        try:
            if lfields[0][1] == None:
                raise  KeyError()
            field = data[lfields[0][1]]
        except:
            field = lfields[0][2]
        lfields = lfields[1:]
        if type(field) != list:
            field = [field]
        #if full_field[3] == list and type(field) == list:
        #    field = [str(field)]
        arg_sets = []
        for f in field:
            mpre = pre + [f]
            a = self.pivot_arguments(table, lfields, data, mpre)
            arg_sets = a + arg_sets
        return arg_sets

    def generate_arguments(self, table, arguments, data):
        # For every argument, we create permutations
        #  of all argument sets
        arguments[table] = self.pivot_arguments(
            table, self.field_mappings[table],
            data, [])
            
    def gen_declaration(self, table_name: str, var_name: str, typename: str, default_val: str):
        return '\n    _%s %s := %s;' % (var_name, typename, default_val)
        
    def add_foreign_key(self, links, foreign_key_str: str, table, field, keyval):
        if (table, field) in links:
            return foreign_key_str
        links[(table, field)] = '_%s' % field
        return foreign_key_str + self.gen_declaration(table, field, 'INTEGER', keyval)
        
    def get_key_query(self, table, field):
        query = "SELECT %s FROM %s"\
          % (self.primary_keys[table], table)
        i = 0
        last = len(self.field_mappings[table])
        for f in self.field_mappings[table]:
            if 'TIME' in f[0]:
                i += 1
                continue
            fq = query
            if i == 0:
                fq = fq + " WHERE"
            elif i != last:
                fq = fq + " AND"
            fq = fq + " %s = " % f[0]
            fq = fq + "%s"
            query = fq
            i = i+1
        return query + ' LIMIT 1'

    def execute(self, data, cursor):
        links = {}
        megaq = ''
        megarg = []
        
        megakeys = ''
        
        megaq = '''\
CREATE OR REPLACE FUNCTION public.insertion() 
    RETURNS INTEGER AS
$func$
DECLARE%s
BEGIN%s
    RETURN 0;
END
$func$ LANGUAGE plpgsql;
SELECT public.insertion();'''
        # First, make variable declarations for keys
        foreign_keys = ''
        inserts = ''
        # This is for referenced key fields
        for table in self.kfield_mappings:
            for f in self.kfield_mappings[table]:
                flen = len(foreign_keys)
                foreign_keys = self.add_foreign_key(
                    links, foreign_keys,
                    f[1], f[0], 'NULL')
                
                if f[1] == 'RUN':
                    continue
                
                q = self.get_key_query(f[1], f[0])
                fields = [f for f in self.field_mappings[f[1]] if 'TIME' not in f[0]]
                arg = self.pivot_arguments(f[1], fields, data, [])[0]
                if len(foreign_keys) != flen:
                    megarg = megarg + arg
                    inserts = inserts + '\n    %s INTO %s;' % (q, '_' + f[0])
        # This is for table links
        for table in self.table_links:
            for f in table[:2]:
                flen = len(foreign_keys)
                foreign_keys = self.add_foreign_key(
                    links, foreign_keys,
                    f[0], f[1], 'NULL')
                
                if f[0] == 'RUN':
                    continue
                
                q = self.get_key_query(f[0], f[1])
                fields = [f for f in self.field_mappings[f[0]] if 'TIME' not in f[0]]
                arg = self.pivot_arguments(f[0], fields, data, [])[0]
                if len(foreign_keys) != flen:
                    megarg = megarg + arg
                    inserts = inserts + '\n    %s INTO %s;' % (q, '_' + f[1])
    
        inserts = inserts + '\n\n'
    
        # Now create basic insertion queries, no keys
        for table in self.field_mappings:
            if len(self.kfield_mappings[table]) > 0:
                continue
            query = self.gen_query_n(table, self.field_mappings[table], [0, 4])
            fkey = (table, self.primary_keys[table])
            if fkey in links:
                query = query + ' INTO %s' % links[fkey]
                query = 'IF %s IS NULL THEN %s; END IF' % (links[fkey], query)
            
            arg_sets = self.pivot_arguments(table, self.field_mappings[table], data, [])
            for a in arg_sets:
                inserts = inserts + '''
    %s;''' % (query,)
                megarg = megarg + a
        
        for table in self.field_mappings:
            if len(self.kfield_mappings[table]) == 0:
                continue
            query = self.gen_query_n(table,
                    self.field_mappings[table] + self.kfield_mappings[table] + self.blobs[table],
                    [0])
            fkey = (table, self.primary_keys[table])
            if table in self.primary_keys and fkey in links:
                query = query + ' INTO %s' % links[fkey]
            
            # Generate argument sets for the query
            arg_sets = self.pivot_arguments(table, self.field_mappings[table], data, [])
            for a in arg_sets:
                inserts = inserts + '''
    %s;''' % (query,)
                megarg = megarg + a
            # Blob entries are always added last
            for f in self.blobs[table]:
                megarg = megarg + [str(data).encode('utf8')]
        
        megaq = megaq % (foreign_keys, inserts)
        
        cursor.execute(megaq, megarg)

        
    def serialize(self, cursor, table, page=0, count=20, extra_opts=''):
        for e in self.field_mappings.keys():
            if e.upper() == table.upper():
                break
        else:
            return []
    
        fields_ = [f[0] for f in self.field_mappings[table.upper()]]
        fields = ""
        for f in fields_:
            fields = fields + "," + f
        
        fields = fields[1:]
    
        cursor.execute('SELECT %s FROM %s %s OFFSET %s LIMIT %s'\
             % (fields, table, extra_opts, page * count, count))
        
        data = cursor.fetchall()
       
        cursor.execute('SELECT count(*) FROM %s' % table)
        num_pages = ceil(cursor.fetchone()[0] / count)
 
        if not data:
            return [], num_pages
        
        proc = []
        
        for i, row in enumerate(data):
            row_data = {}
            proc.append(row_data)
            for field, field_data in zip(fields_, row):
                row_data[field.lower()] = field_data
        
        return proc, num_pages


key_run = ('RUN', 'RUN_ID')
sql = Sequelizer()\
      \
      .table('RUN', 'RUN_ID')\
      .field('BUILD_VERSION', 'build.version', '0.0.0')\
      .field('CWD', 'runtime.cwd', '.')\
      .field('MEMORY', 'memory.bank', -1.0, int)\
      .field('SWAPSPACE', 'memory.virtual.total', -1.0, int)\
      .field('SWAPSPACE_FREE', 'memory.virtual.available', -1., int)\
      .field('SYSTEM', 'runtime.system', 'Unknown')\
      .field('SUBMIT_TIME', None, time(), timestamp, 'to_timestamp(%s)')\
      .field('COMMANDLINE', 'runtime.arguments')\
      \
      .table('ARCHITECTURE', None)\
      .field('ARCH_NAME', 'build.architecture', 'Unknown')\
      .table('COMPILER', None)\
      .field('COMPILER_NAME', 'build.compiler', 'Unknown 0.0')\
      \
      .table('APPLICATION', 'APP_ID')\
      .field('APP_NAME', 'application.name', 'Unknown')\
      .field('APP_ORG', 'application.org', 'Unknown')\
      .field('APP_VERSION', 'application.version', -1, int)\
      \
      .table('PROCESSOR', 'PROC_ID')\
      .field('PROC_MANUFACTURER', 'processor.manufacturer', 'Unknown')\
      .field('PROC_NAME', 'processor.model', 'Unknown')\
      .field('PROC_HYPERTHREADING', 'processor.hyperthreading', False, bool)\
      .field('PROC_FPU', 'processor.fpu', False, bool)\
      .field('PROC_PAE', 'processor.pae', False, bool)\
      .field('PROC_THREADS', 'processor.threads', -1, int)\
      .field('PROC_CORES', 'processor.cores', -1, int)\
      \
      .table('PROCESSOR_FREQ', ('PROC_FREQ', 'PROC_ID'))\
      .keyfield('PROC_ID', 'PROCESSOR', '_PROC_ID')\
      .field('PROC_FREQ', 'processor.frequency', -1.0, float)\
      \
      .table('PROCESSOR_FW', ('PROC_FW', 'PROC_ID'))\
      .keyfield('PROC_ID', 'PROCESSOR', '_PROC_ID')\
      .field('PROC_FW', 'processor.firmware', '0x0')\
      \
      .table('DEVICE', 'DEV_ID')\
      .field('DEV_NAME', 'device', 'Unknown')\
      .field('DEV_MOTHERBOARD', 'device.motherboard', 'Unknown')\
      .field('DEV_CHASSIS', 'device.chassis', 'Unknown')\
      .field('DEV_PLATFORM', 'device.platform', -1)\
      .field('DEV_TYPE', 'device.type', -1)\
      .field('DEV_DPI', 'device.dpi', -1.0)\
      \
      .table('RUN_DEVICE', ('DEV_ID', 'DEV_VERSION'))\
      .keyfield('DEV_ID', 'DEVICE', '_DEV_ID')\
      .keyfield('RUN_ID', 'RUN', '_RUN_ID')\
      .field('DEV_VERSION', 'device.version', 'Unknown')\
      \
      .table('RUN_ARCH', None)\
      .field('ARCH_NAME', 'build.architecture', 'Unknown')\
      .keyfield('RUN_ID', 'RUN', '_RUN_ID')\
      \
      .table('RUN_COMPILER', None)\
      .field('COMPILER_NAME', 'build.compiler')\
      .keyfield('RUN_ID', 'RUN', '_RUN_ID')\
      \
      .table('RUN_REPORT', None)\
      .field('REPORT_FORMAT', '///', 'Chrome/JSON')\
      .blobfield('REPORT')\
      .keyfield('RUN_ID', 'RUN', '_RUN_ID')\
      \
      .link(key_run, ('APPLICATION', 'APP_ID'), 'RUN_APP')\
      .link(key_run, ('PROCESSOR', 'PROC_ID'), 'RUN_PROC')


def rest_database(f):
    @wraps(f)
    def db(*args, **kwargs):
        ret = f(conn.cursor(), *args, **kwargs)
        database_commit()
        return ret
    return db

def sign_response(r):
    r.headers['X-Coffee-Variant'] = KAFEI_SIGNATURE

def rest_validate(f):
    def handle_request(req):
        if not req.is_json and len(req.data) > 0:
            return (406, 'Invalid Content-Type')
        if 'Accept' in req.headers and req.headers['Accept'] !=  'application/json':
            return (406, 'Invalid Accept')
        return (200, None)
        
    @wraps(f)
    def valid(*args, **kwargs):
        code, msg = handle_request(request)
        if code != 200:
            return None, msg, code, None
        
        return f(*args, **kwargs)
    return valid

def rest_authenticate(f):
    def validate_token(token):
        if not token.startswith('token'):
            return False
        return True
    def handle_auth(req):
        if 'X-Coffee-Token' not in req.headers:
            return (401, 'Authorization procedure failed')
        if not validate_token(req.headers['X-Coffee-Token']):
            return (401, 'Authorization procedure failed')
        return (200, None)
    @wraps(f)
    def auth(*args, **kwargs):
        code, msg = handle_auth(request)
        if code != 200:
            return None, msg, code, None
        
        return f(*args, **kwargs)
    return auth

def headers_update(r, h):
    for k in h:
        r.headers[k] = h[k]

def pagination_n(page=0, count=50, max_count=100):
    page = 0
    count = 50

    try:
        page = int(request.args.get('page'))
    except TypeError:
        pass
    try:
        count = int(request.args.get('count'))
    except TypeError:
        pass

    count = max(min(count, max_count), 1)
    page = min(0, page)

    return count, page

def pagination_data(page=0, pages=0):
    return {'X-Pages-Remaining': pages - page, 'X-Pages-Total': pages}

def rate_limit_n(req):
    limit = 10000
    rem = limit
    rlim = {'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': rem}
    
    if rem <= 0:
        msg = jsonify({'message': 'Too many requests', 'data': None})
        r = make_response(msg)
        headers_update(r, rlim)
        return r, rlim
    return None, rlim

def rate_limit(f):
    @wraps(f)
    def rlim(*args, **kwargs):
        r, rlim = rate_limit_n(request)
        if r is not None:
            return r
        
        return f(rlim, *args, **kwargs)
    return rlim
        
def rest_wrap_json(f):
    @wraps(f)
    def db_wrap(*args, **kwargs):
        r, rlim = rate_limit_n(request)
       
        if r is not None:
            return r
    
        data, msg, code, extra = f(*args, **kwargs)
 
        r = make_response(jsonify({'message': msg, 'data': data}), code)
        if extra is not None:
            headers_update(r, extra)
        sign_response(r)
        headers_update(r, rlim)
        return r
    return db_wrap


@app.route('/v1/reports', methods=['POST', 'PUT'])
@rest_wrap_json
@rest_database
@rest_validate
@rest_authenticate
def submit_report(cur):
    if 'runtime.arguments' in request.json:
        request.json['runtime.arguments'] = str(request.json['runtime.arguments'])

    try:
        sql.execute(request.json, cur)
    except Exception as e:
        traceback.print_exc()
    sys.stdout.flush()
    return None, 'OK', 200, None


@app.route('/v1/runs', methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_runs(cur):
    count, page = pagination_n(0, 50, 100)
    data, pages = sql.serialize(cur, 'run', page, count, 'order by submit_time desc')
    return data, 'OK', 200, pagination_data(page, pages)


@app.route('/v1/blob', methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_blob_list(cur):
    cur.execute('SELECT RUN_ID FROM RUN_REPORT;')
    return [x[0] for x in cur.fetchall()], 'OK', 200, None


@app.route('/v1/blob/<run_id>', methods=['GET'])
@rest_database
def get_blobs(cur, run_id):
    if 'Accept' in request.headers and request.headers['Accept'] != 'application/octet-stream':
        return make_response(str(), 406)

    cur.execute('SELECT REPORT, REPORT_FORMAT FROM RUN_REPORT WHERE RUN_ID = %s;', [run_id])
    data = None
    data_format = None
    try:
        fetch = cur.fetchone()
        data_format = str(fetch[1])
        data = fetch[0]
    except TypeError:
        pass
    if data is not None:
        r = make_response(bytes(data), 200)
        r.headers['X-Report-Format'] = data_format
        r.headers['Content-Type'] = 'application/octet-stream'
    else:
        r = make_response(jsonify({'error': 'No such entry'}), 404)
        r.headers['Content-Type'] = 'application/json'
    return r


@app.route('/v1/devices', methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_devices(cur):
    count, page = pagination_n(0, 50, 100)
    data, pages = sql.serialize(cur, 'device', page, count)
    return data, 'OK', 200, pagination_data(page, pages)


@app.route("/v1/processors", methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_processors(cur):
    count, page = pagination_n(0, 50, 100)

    cur.execute('select row_to_json(t) from (select *, array(select proc_freq from processor_freq where proc_id = processor.proc_id) as proc_freqs, array(select proc_fw from processor_fw where proc_id = processor.proc_id) proc_fws from processor limit %s offset %s) t;' % (count, count * page))
    data = cur.fetchall()
    return data, 'OK', 200, None

@app.route("/v1/", methods=['GET'])
@rest_wrap_json
@rest_validate
def get_api():
    return {
      "endpoints": {
        "reports": ['POST'],
        "runs": ['GET'],
        "devices": ['GET'],
        "processors": ['GET'],
        "statistics": {
          ".": ['GET'],
          "os": ['GET'],
          "arch": ['GET'],
          "version": ['GET']
        },
        "blob": ['GET']
      },
      "schemas": {}
    }, 'OK', 200, None

stat_queries = {
    'os':
'''
select system, count(system) from run
    group by system 
''',
    'arch':
'''
select count(run_id), arch_name from run_arch
    group by arch_name
    order by count desc
''',
    'os-arch':
'''
select system, arch_name, count(arch_name) from run
    join run_arch on run.run_id = run_arch.run_id
    group by arch_name, system
''',
    'version':
'''
select count(run_id), system, build_version from run
    group by system, build_version
    order by count desc
'''
}

@app.route('/v1/statistics/<stat>', methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_statistics(cur, stat):

    try:
        query = stat_queries[stat]
    except KeyError:
        query = stat_queries['version']
    
    cur.execute('select row_to_json(t) from (%s limit 20) t;' % query)
    data = cur.fetchall()
    return data, 'OK', 200, None


@app.route('/v1/statistics/', methods=['GET'])
@rest_wrap_json
@rest_validate
def get_statistics_variants():
    return list(stat_queries.keys()), 'OK', 200, None


"""
@app.route('/v1/statistics', methods=['GET'])
def get_stats_redir():
    return redirect(url_for('get_statistics', stat='any'))


@app.route('/reports', methods=['POST', 'PUT'])
def submit_report_redir():
    return redirect(url_for('submit_report'))
"""

@app.route("/api", methods=['GET'])
@app.route("/", methods=['GET'])
def puzzle():
    return """
<html style="
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  min-height: 100%;
  ">
  <head>
    <title>There is nothing here...</title>
  </head>
  <body style="
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    margin: auto;
    background-color: #202020;
    color: white;">

    <span style="flex-grow: 1;"></span>

    <img style="height: 5em;width: 5em; object-fit: contain;" src="https://i.imgur.com/GI2JaNM.png">
    <p>There really is nothing here :)</p>
    <!-- OR IS THERE??? -->
    
    <span style="flex-grow: 1;"></span>
    
    <div style="
      margin: 0;
      font-size: 0.1em;
      display: flex;
      flex-direction: column;
      width: 100%;">
        <p style="margin: 0;align-self: center;">
            <a href="https://hbirchtree.github.io">(hint)</a>
        </p>
    </div>
  </body>
</html>
"""

while True:
    try:
        bootstrap(app, 'KAFEI')
    except Exception:
        pass

