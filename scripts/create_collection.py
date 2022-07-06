#!/usr/bin/env python

import sys
import pg8000

from config import config, TABLES, COLLECTION_VISIBILITY


target = {}
for n, item in enumerate(['uid', 'tid', 'title', 'descr'], 1):
    try: target[item] = sys.argv[n]
    except IndexError: raise RuntimeError("Required %s" % item)

conn = pg8000.connect(
    user=config.get('db', 'user'),
    password=config.get('db', 'password'),
    database=config.get('db', 'database'),
    host=config.get('db', 'host'),
    port=config.getint('db', 'port')
)
cursor = conn.cursor()


def create_tag(conn, cursor, uid, tid, title, descr, visibility=COLLECTION_VISIBILITY['private']):
    cursor.execute("""
    INSERT INTO {tags} ("userId", "typeId", title, description, visibility) VALUES ({uid}, {tid}, '{title}', '{descr}', '{visibility}') RETURNING id;
    """.format(tags=TABLES['collections'], uid=uid, tid=tid, title=title, descr=descr, visibility=visibility))
    conn.commit()
    return cursor.fetchone()[0]


tag_id = create_tag(conn, cursor, target['uid'], target['tid'], target['title'], target['descr'])
print(tag_id)

conn.close()
sys.exit(0)
