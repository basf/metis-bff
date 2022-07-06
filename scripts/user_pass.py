#!/usr/bin/env python

import sys
import bcrypt
import pg8000

from config import config, TABLES


try: email = sys.argv[1]
except IndexError: raise RuntimeError("Required email")
try: password = sys.argv[2]
except IndexError: raise RuntimeError("Required password")

conn = pg8000.connect(
    user=config.get('db', 'user'),
    password=config.get('db', 'password'),
    database=config.get('db', 'database'),
    host=config.get('db', 'host'),
    port=config.getint('db', 'port')
)
cursor = conn.cursor()

passhash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

cursor.execute("""SELECT "userId" FROM {emails} WHERE email = '{email}';""".format(
    emails=TABLES['emails'],
    email=email))

try: uid = cursor.fetchone()[0]
except: raise RuntimeError("Email unknown")

cursor.execute("""UPDATE {users} SET password = '{pwd}' WHERE id = {uid};""".format(
    users=TABLES['users'],
    pwd=passhash,
    uid=uid))

conn.commit()
conn.close()
sys.exit(0)
