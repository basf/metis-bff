#!/usr/bin/env node

const { db, USERS_TABLE, hashString } = require('./../../services/db');

const args = process.argv.slice(2),
    user_id = parseInt(args[0]),
    password = args[1];

if (!user_id || !password){
    console.error('Usage: script <user id> <new pass>');
    process.exit(1);
}

hashString(password).then((password) => {
    db(USERS_TABLE)
        .where('id', '=', user_id)
        .update({ password }, ['*'])
        .then(console.log)
        .catch(console.error);
});
