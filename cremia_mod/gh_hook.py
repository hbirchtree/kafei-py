from cremia_mod.common import Entity


class GitHubHook:
    def __init__(self):
        pass

    def ensure_repo(self, repo, **kwargs):
        return 'repo_name' in kwargs and kwargs['repo_name'] == repo

    def filter(self, **kwargs):
        if 'event' not in kwargs or kwargs['event'] not in self.events():
            return False

        return True

    def events(self):
        return []

    def __call__(self, event, body):
        return Entity({'message': 'OK'}, 200)
