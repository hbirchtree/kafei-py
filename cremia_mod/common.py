import re
from subprocess import Popen, PIPE
from flask import request, current_app as app

branch_rgx = re.compile('^refs\/heads\/([A-Za-z][A-Za-z0-9_\/\-\.]*[A-Za-z0-9_\-\.])$')
sha_rgx = re.compile('^[A-Za-z0-9]+$')


def git_eval(ref):
    branch = re.findall(branch_rgx, ref)
    if len(branch) == 0:
        return None
    branch = branch[0]
    if branch.endswith('.lock'):
        return None
    if '..' in branch:
        return None
    return branch


def sha_eval(sha):
    m = re.match(sha_rgx, sha)
    return m.string == sha


def bash_run(cmd):
    app.logger.debug(cmd)
    proc = Popen(['bash', '-c', cmd], stdout=PIPE)
    proc.wait()
    return proc.stdout.read().decode()


def bash_extract(out):
    try:
        return out.split('\n')[0]
    except IndexError:
        return ''


def check_hdr(k):
    if k in request.headers:
        return request.headers[k]
    return ''


class Entity:
    def __init__(self, object, code=200):
        self.object = object
        self.status_code = code
