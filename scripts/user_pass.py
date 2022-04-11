#!/usr/bin/env python

import sys
from collections import OrderedDict
from configparser import RawConfigParser

import bcrypt
import pg8000


# non-standard ini format handling
class MultiOrderedDict(OrderedDict):
    def __setitem__(self, key, value):
        if isinstance(value, list) and key in self:
            self[key].extend(value)
        else:
            super().__setitem__(key, value)


try: email = sys.argv[1]
except IndexError: sys.exit("Required email")
try: password = sys.argv[2]
except IndexError: sys.exit("Required password")

cnf = RawConfigParser(dict_type=MultiOrderedDict, strict=False)
cnf.read('env.ini')

conn = pg8000.connect(user=cnf.get('db', 'user'), password=cnf.get('db', 'password'), database=cnf.get('db', 'database'), host=cnf.get('db', 'host'), port=cnf.getint('db', 'port'))
cursor = conn.cursor()

passhash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

cursor.execute("UPDATE bscience_users SET password = '%s' WHERE email = '%s';" % (passhash, email))
conn.commit()
conn.close()
sys.exit(0)
