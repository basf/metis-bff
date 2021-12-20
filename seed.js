const { db, hashPassword } = require('./services/db');


Promise.all([
    db.schema.dropTableIfExists('users'),
    db.schema.dropTableIfExists('user_datasets'),
    db.schema.dropTableIfExists('user_calculations'),
]).then(() => {

    const promises = [];
    promises.push(db.schema.hasTable('users').then((exists) => {
        if (!exists) {
            return db.schema.createTable('users', (table) => {
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
    }));
    promises.push(db.schema.hasTable('user_datasources').then((exists) => {
        if (!exists) {
            return db.schema.createTable('user_datasources', (table) => {
                table.increments('id');
                table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
                table.uuid('uuid').unique();
                table.timestamps(false, true);
            });
        } else {
            console.log('AFTER TABLE');
        }
    }));
    promises.push(db.schema.hasTable('user_calculations').then((exists) => {  
        if (!exists) {
            return db.schema.createTable('user_calculations', (table) => {
                table.increments('id');
                table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
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
    return db('users').insert({
        username: 'TestTest',
        email: 'test@test.com',
        firstname: 'Test',
        lastname: 'Test',
        password,
    }, ['id']);
});
