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
        self.primary_keys = {}
        self.table_links = []
        pass

    def table(self, table_name: str, prim_key: str):
        self.field_mappings[table_name] = []
        self.kfield_mappings[table_name] = []
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
                 field_name: str, table_ref: str):
        f = (field_name, table_ref, '%s')
        self.kfield_mappings[self.cur_table].append(f)
        return self

    # t1 = tuple(str, str)
    def link(self,
             t1: Tuple[str, str],
             t2: Tuple[str, str],
             tu: str):
        self.table_links.append((t1, t2, tu))
        return self

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
                q = q +  "%s,"
        if len(fields) > 0:
            q = q[:-1]
        if type(self.primary_keys[table]) == str:
            q = q + ")"\
                " ON CONFLICT DO NOTHING" +\
                " RETURNING " +\
                self.primary_keys[table] +\
                ";"
        else:
            q = q + ")"\
                " ON CONFLICT DO NOTHING;"
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

    def execute(self, data, cursor):
        # Insert queries
        queries = {}
        arguments = {}
        # Key queries, because single-query solutions were nasty AF
        bqueries = {}

        for table in self.field_mappings:
            # If the table has key references, delay it
            if len(self.kfield_mappings[table]) > 0:
                continue
            # First, generate the query strings
            q = self.gen_query_n(table, self.field_mappings[table], [0, 4])
            queries[table] = q

            bqueries[table] = "SELECT %s FROM %s"\
              % (self.primary_keys[table], table)
            i = 0
            last = len(self.field_mappings[table])
            for f in self.field_mappings[table]:
                fq = bqueries[table]
                if i == 0:
                    fq = fq + " WHERE"
                elif i != last:
                    fq = fq + " AND"
                fq = fq + " %s = " % f[0]
                fq = fq + "%s"
                bqueries[table] = fq
                i = i+1
            bqueries[table] = bqueries[table] + ";"
            
            # ... then create arguments
            
            arguments[table] = self.pivot_arguments(table, self.field_mappings[table], data, [])

        links = {}
        
        # Execute basic queries, get the keys
        for q in queries:
            try:
                query = queries[q]
                arg = arguments[q]
                for a in arg:
                    cursor.execute(query, a)
                try:
                    key = cursor.fetchall()
                except psycopg2.ProgrammingError:
                    # In this case, the query actually returned nothing
                    # This is amended with the next sequence.
                    key = []
                if len(key) == 0:
                    cursor.execute(bqueries[q], arg[0])
                    key = cursor.fetchall()
                links[q] = key[0][0]
            except Exception as e:
                print("QUERY: '%s' with" % queries[q], arguments[q])
                raise e
                


        for table in self.field_mappings:
            if len(self.kfield_mappings[table]) == 0:
                continue
            fields = self.field_mappings[table]
            kfields = self.kfield_mappings[table]
            
            q = self.gen_query_n(table, fields + kfields, [0])
            args = self.pivot_arguments(table, fields, data, [])
            for f in kfields:
                for a in args:
                    a.append(links[f[1]])
            cursor.executemany(q, args)

        # Create queries for relational tables
        for link in self.table_links:
            q = 'INSERT INTO %s (%s, %s)' % (link[2], link[0][1], link[1][1])
            q = q + ' VALUES(%s,%s) ON CONFLICT DO NOTHING;'
            k1 = links[link[0][0]]
            k2 = links[link[1][0]]
            args = [k1, k2]
            cursor.execute(q, args)
        
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
        print(num_pages)
 
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
      .table('ARCHITECTURE', 'ARCH_NAME')\
      .field('ARCH_NAME', 'build.architecture', 'Unknown')\
      .table('COMPILER', 'COMPILER_NAME')\
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
      .keyfield('PROC_ID', 'PROCESSOR')\
      .field('PROC_FREQ', 'processor.frequency', -1.0, float)\
      \
      .table('PROCESSOR_FW', ('PROC_FW', 'PROC_ID'))\
      .keyfield('PROC_ID', 'PROCESSOR')\
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
      .keyfield('DEV_ID', 'DEVICE')\
      .field('DEV_VERSION', 'device.version', 'Unknown')\
      \
      .link(key_run, ('ARCHITECTURE', 'ARCH_NAME'), 'RUN_ARCH')\
      .link(key_run, ('COMPILER', 'COMPILER_NAME'), 'RUN_COMPILER')\
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
        if not req.is_json:
            return (406, 'Invalid Content-Type')
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
            return None, msg, code
        
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

    sql.execute(request.json, cur)
    return None, 'OK', 200, None


@app.route('/v1/runs', methods=['GET'])
@rest_wrap_json
@rest_database
@rest_validate
def get_runs(cur):
    count, page = pagination_n(0, 50, 100)
    data, pages = sql.serialize(cur, 'run', page, count, 'order by submit_time desc')
    return data, 'OK', 200, pagination_data(page, pages)
    

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

stat_queries = {
    'os':
'''
select dev_version, count(run_id) from run_device
    group by dev_version 
''',
    'arch':
'''
select count(run_id), arch_name from run_arch
    group by arch_name
    order by count desc
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
    margin: auto;">

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

bootstrap(app, 'KAFEI')

