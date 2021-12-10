const { db: dbConfig } = require('../config');

const bcrypt = require('bcrypt');

const db = require('knex')(dbConfig);

const tnames = {
    table_users: dbConfig.tprefix + 'users',
};

module.exports = {
    db,
    hashPassword,
    comparePasswords,
    tnames,
};

async function hashPassword(pass) {
    return bcrypt.hash(pass, 10);
}

async function comparePasswords(pass, hash) {
    return bcrypt.compare(pass, hash);
}