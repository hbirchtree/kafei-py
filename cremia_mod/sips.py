from cremia_mod.common import check_hdr, bash_run, Entity
from cremia_mod.gh_hook import GitHubHook


class Processor(GitHubHook):
    def __init__(self):
        super().__init__()

    def filter(self, **kwargs):
        if not super().filter(**kwargs):
            return False

        if 'repo_name' not in kwargs or kwargs['repo_name'] != 'hbirchtree/coffee-sips':
            return False

        return True

    def events(self):
        return [
            'push'
        ]

    def __call__(self, event, body):
        bash_run('cd blog && git pull && hugo')

        return Entity({'message': 'OK'}, 200)
