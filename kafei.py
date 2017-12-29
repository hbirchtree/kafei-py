#!/usr/bin/python3

import logging
from logging.handlers import RotatingFileHandler
from apscheduler.schedulers.background import BackgroundScheduler as Scheduler
from flask import Flask, jsonify, request, make_response, Response
from os import environ as ENV
import ssl
import psycopg2
import atexit
from typing import Tuple, Dict, List, Any
from time import time
from base64 import b64decode as mysteryfun

# Flask server
app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Add function for committing to database
cron = Scheduler(daemon=True)
cron.start()

# Create DB connection
try:
    conn = psycopg2.connect("dbname='postgres' user='postgres' host='localhost' password='%s'" % ENV['DBPASS'])
except:
    print("Unable to connect to database")
    exit(1)


def stock_response(r):
    r.headers['X-Coffee-Variant'] = 'Kafei/0.1'
    return r


def database_commit():
    print("-- Committing to database")
    conn.commit()


def validate_token(token):
    if not token.startswith('token '):
        return False
    return True


def handle_request(req):
    if not req.is_json:
        return (406, 'Invalid Content-Type')
    if not validate_token(req.headers['X-Coffee-Token']):
        return (401, 'Authorization procedure failed')
    return (200, 'OK')


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
            query = queries[q]
            arg = arguments[q]
            for a in arg:
                cursor.execute(query, a)
            key = cursor.fetchall()
            if len(key) == 0:
                cursor.execute(bqueries[q], arg[0])
                key = cursor.fetchall()
            links[q] = key[0][0]


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

        pass
        
    def serialize(self, query: str=''):
        pass



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
      .table('DEVICE_VERSION', ('DEV_ID', 'DEV_VERSION'))\
      .keyfield('DEV_ID', 'DEVICE')\
      .field('DEV_VERSION', 'device.version', 'Unknown')\
      \
      .link(key_run, ('ARCHITECTURE', 'ARCH_NAME'), 'RUN_ARCH')\
      .link(key_run, ('COMPILER', 'COMPILER_NAME'), 'RUN_COMPILER')\
      .link(key_run, ('APPLICATION', 'APP_ID'), 'RUN_APP')\
      .link(key_run, ('PROCESSOR', 'PROC_ID'), 'RUN_PROC')\
      .link(key_run, ('DEVICE', 'DEV_ID'), 'RUN_DEVICE')


@app.route('/reports', methods=['POST', 'PUT', 'GET'])
def submit_report():
    code, msg = handle_request(request)
    
    if code != 200:
        return make_response(jsonify({'message': msg}), code)

    print("-- Starting response")

    cur = conn.cursor()

    if request.method == 'GET':
        data = []
        cur.execute("SELECT * FROM RUN;")
        for r in cur.fetchall():
            data = data + [r]
        r = make_response(jsonify({'message': 'OK',  'data': data}))
        return stock_response(r)

    #cur.execute("""
#INSERT INTO RUN
#(BUILD_VERSION,MEMORY, CWD, SWAPSPACE, SWAPSPACE_FREE, COMMANDLINE)
#VALUES('1.0', 0, '', 0, 0, '') RETURNING RUN_ID;""")


    if 'runtime.arguments' in request.json:
        request.json['runtime.arguments'] = str(request.json['runtime.arguments'])

    sql.execute(request.json, cur)

    #print(cur.fetchall())

    database_commit()
    
    print("-- Finished request")

    r = make_response(jsonify({'message': msg}))
    return stock_response(r)

@app.route("/", methods=['GET'])
def puzzle():
    return """
<html>
  <head>
    <title>There is nothing here...</title>
  </head>
  <body style="
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    margin: 0;">

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


def getenv(k):
    try:
        return ENV[k]
    except KeyError:
        return ''

if __name__ == "__main__":
    #cron.add_job(database_commit, 'interval', minutes=5)
    atexit.register(lambda: cron.shutdown(wait=False))

    # Add a logger
    handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
    logging.getLogger('werkzeug').addHandler(handler)
    logging.getLogger('__name__').addHandler(handler)
    app.logger.addHandler(handler)

    KAFEI_DEBUG = False
    KAFEI_PORT = 443
    if getenv('KAFEI_DEBUG') == '1':
        KAFEI_DEBUG = True
    if len(getenv('KAFEI_PORT')) > 0:
        KAFEI_PORT = int(ENV['KAFEI_PORT'])
    app.run(host="0.0.0.0", threaded=True,
            port=KAFEI_PORT, debug=KAFEI_DEBUG,
            ssl_context=(ENV['SSL_CERT'], ENV['SSL_KEY']))

