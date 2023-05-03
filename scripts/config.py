
import os.path
from collections import OrderedDict
from configparser import RawConfigParser


# non-standard ini format handling
class MultiOrderedDict(OrderedDict):
    def __setitem__(self, key, value):
        if isinstance(value, list) and key in self:
            self[key].extend(value)
        else:
            super().__setitem__(key, value)


CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../conf/env.ini")
assert os.path.exists(CONFIG_PATH), "%s not found" % CONFIG_PATH

config = RawConfigParser(dict_type=MultiOrderedDict, strict=False)
config.read(CONFIG_PATH)

TABLES = {
    'users':                   config.get('db', 'tprefix') + 'users',
    'emails':                  config.get('db', 'tprefix') + 'users_emails',
    'oauths':                  config.get('db', 'tprefix') + 'users_oauths',
    'collections':             config.get('db', 'tprefix') + 'user_collections',
    'collections_datasources': config.get('db', 'tprefix') + 'user_collections_datasources',
    'collections_shared':      config.get('db', 'tprefix') + 'user_collections_shared',
}

COLLECTION_VISIBILITY = {
    'private': 'private',
    'shared': 'shared',
    'community': 'community',
}
