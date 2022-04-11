#!/usr/bin/env node

const { db, USERS_TABLE, hashPassword } = require('./../../services/db');

hashPassword('test').then((password) => {
    db(USERS_TABLE).where('email', '=', 'user@example.com').update({password}, ['*']).then(console.log).catch(console.error);
});
