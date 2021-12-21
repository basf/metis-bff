const { db: dbConfig } = require('../config');

const bcrypt = require('bcrypt');

const db = require('knex')(dbConfig);

const DEFAULT_FIELDS = ['id', 'userId', 'uuid', 'created_at', 'updated_at'];

const USERS_TABLE = dbConfig.tprefix + 'users';
const USER_CALCULATIONS_TABLE = dbConfig.tprefix + 'user_calculations';
const USER_DATASOURCES_TABLE = dbConfig.tprefix + 'user_datasources';


const selectDataSourcesByUserId = selectAllByUserId(USER_DATASOURCES_TABLE);
const selectCalculationsByUserId = selectAllByUserId(USER_CALCULATIONS_TABLE);
const deleteUserDataSource = deleteFirstByUserId(USER_DATASOURCES_TABLE);
const deleteUserCalculation = deleteFirstByUserId(USER_CALCULATIONS_TABLE);
const insertUserDataSource = insertByUserId(USER_DATASOURCES_TABLE);
const insertUserCalculation = insertByUserId(USER_CALCULATIONS_TABLE);
const selectDataSourceByUserId = selectFirstByUserId(USER_DATASOURCES_TABLE);

module.exports = {
    db,
    hashPassword,
    comparePasswords,
    deleteUserDataSource,
    insertUserDataSource,
    insertUserCalculation,
    deleteUserCalculation,
    selectDataSourceByUserId,
    selectDataSourcesByUserId,
    selectCalculationsByUserId,
    USER_CALCULATIONS_TABLE,
    USER_DATASOURCES_TABLE,
    USERS_TABLE,
};

async function hashPassword(pass) {
    return bcrypt.hash(pass, 10);
}

async function comparePasswords(pass, hash) {
    return bcrypt.compare(pass, hash);
}

function insertByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, inserts = {}, fields = defaultFields) => {
        const inserted = await db(table).insert({ ...inserts, userId, }, fields);
        return inserted && inserted[0];
    };
}

function deleteFirstByUserId(table, defaultFields = ['uuid']) {
    return async (userId, id, fields = defaultFields) => {
        const deleted = await db(table).where({ id, userId }).del(fields);
        return deleted && deleted[0];
    };
}

function selectAllByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, query = {}, fields = defaultFields) => {
        return db.select(...fields).from(table).where({ userId, ...query });
    };
}

function selectFirstByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, query = {}, fields = defaultFields) => {
        return db.select(...fields).from(table).where({ userId, ...query }).first();
    };
}