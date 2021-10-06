const { db: dbConfig } = require('../config');

const bcrypt = require('bcrypt');

const db = require('knex')(dbConfig);

module.exports = {
    db,
    hashPassword,
    comparePasswords,
};

async function hashPassword(pass) {
    return bcrypt.hash(pass, 10);
}

async function comparePasswords(pass, hash) {
    return bcrypt.compare(pass, hash);
}