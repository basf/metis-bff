#!/usr/bin/env node

const { db, hashPassword, tnames } = require('./services/db');

db.schema.dropTableIfExists(tnames.table_users).then(() => {
    return db.schema.hasTable(tnames.table_users).then((exists) => {
        if (!exists) {
            return db.schema.createTable(tnames.table_users, (table) => {
                table.increments('id');
                table.string('githubId').unique();
                table.string('linkedinId').unique();
                table.string('basfId').unique();
                table.string('orcidId').unique();
                table.string('username').unique();
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
    });
})
.then(() => hashPassword('123123'))
.then((password) => {
    return db(tnames.table_users).insert({
        username: 'TestTest',
        email: 'test@test.com',
        firstname: 'Test',
        lastname: 'Test',
        password,
    }, ['id']);
});
