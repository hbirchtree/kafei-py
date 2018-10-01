from os import environ
from uuid import uuid4

CREMIA_API_KEY = None
CREMIA_GIT_DIR = environ['CREMIA_GIT_DIR']
CREMIA_GIT_BRANCH = environ['CREMIA_GIT_BRANCH']
CREMIA_GHB_KEY = None
CREMIA_GIT_BLOB = 'hbirchtree/coffeecutie'

RECENT_RELEASE_HANDLER = None
RECENT_COMMIT_HANDLER = None

CREMIA_QUEUE = []

try:
    with open('CREMIA_key.txt', 'r') as f:
        CREMIA_API_KEY = f.read()
except FileNotFoundError:
    with open('CREMIA_key.txt', 'w') as f:
        key = uuid4()
        CREMIA_API_KEY = key
        f.write(str(key))

try:
    CREMIA_GHB_KEY = environ['GITHUB_TOKEN']
except KeyError:
    print('-- No GitHub API key provided in $GITHUB_TOKEN')

print('-- Server API key: %s' % CREMIA_API_KEY)
