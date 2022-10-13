#!/usr/bin/env python

import sys
import pg8000

from config import config, TABLES, COLLECTION_VISIBILITY


target = {}
for n, item in enumerate(['user_id', 'type_id', 'title', 'descr'], 1):
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


def create_tag(conn, cursor, user_id, type_id, title, descr, visibility=COLLECTION_VISIBILITY['community']):
    cursor.execute("""
    INSERT INTO {tags} ("userId", "typeId", title, description, visibility) VALUES
    ({user_id}, {type_id}, '{title}', '{descr}', '{visibility}')
    RETURNING id;
    """.format(
        tags=TABLES['collections'],
        user_id=user_id,
        type_id=type_id,
        title=title,
        descr=descr,
        visibility=visibility
    ))
    conn.commit()
    return cursor.fetchone()[0]


tag_id = create_tag(conn, cursor, target['user_id'], target['type_id'], target['title'], target['descr'])
print(tag_id)

conn.close()
sys.exit(0)
