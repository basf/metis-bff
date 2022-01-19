#!/usr/bin/env node

const { db, hashPassword, USERS_TABLE, USER_CALCULATIONS_TABLE, USER_DATASOURCES_TABLE } = require('./services/db');

Promise.all([
    db.schema.dropTableIfExists(USERS_TABLE),
    db.schema.dropTableIfExists(USER_DATASOURCES_TABLE),
    db.schema.dropTableIfExists(USER_CALCULATIONS_TABLE),
]).then(() => {

    const promises = [];
    promises.push(db.schema.hasTable(USERS_TABLE).then((exists) => {
        if (!exists) {
            return db.schema.createTable(USERS_TABLE, (table) => {
                table.increments('id');
                table.string('githubId').unique();
                table.string('linkedinId').unique();
                table.string('basfId').unique();
                table.string('orcidId').unique();
                table.string('email').unique();
                table.string('password');
                table.string('firstname');
                table.string('lastname');
                table.jsonb('profile').nullable();
                table.timestamps(false, true);
            });
        } else {
            console.log('AFTER TABLE');
        }
    }));
    promises.push(db.schema.hasTable(USER_DATASOURCES_TABLE).then((exists) => {
        if (!exists) {
            return db.schema.createTable(USER_DATASOURCES_TABLE, (table) => {
                table.increments('id');
                table.bigInteger('userId').unsigned().index().references('id').inTable(USERS_TABLE).onDelete('CASCADE');
                table.uuid('uuid').unique();
                table.timestamps(false, true);
            });
        } else {
            console.log('AFTER TABLE');
        }
    }));
    promises.push(db.schema.hasTable(USER_CALCULATIONS_TABLE).then((exists) => {
        if (!exists) {
            return db.schema.createTable(USER_CALCULATIONS_TABLE, (table) => {
                table.increments('id');
                table.bigInteger('userId').unsigned().index().references('id').inTable(USERS_TABLE).onDelete('CASCADE');
                table.uuid('uuid').unique();
                table.timestamps(false, true);
            });
        } else {
            console.log('AFTER TABLE');
        }
    }));


    return Promise.all(promises);
})
.then(() => hashPassword('123123'))
.then((password) => {
    return db(USERS_TABLE).insert({
        email: 'test@test.com',
        firstname: 'Test',
        lastname: 'Test',
        password,
    }, ['id']);
});
