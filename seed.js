const { db, hashPassword } = require('./services/db');

db.schema.dropTable('users').then(() => {
	return db.schema.hasTable('users').then((exists) => {
		if (!exists) {
			return db.schema.createTable('users', (table) => {
				table.increments('id');
				table.string('githubId');
				table.string('linkedinId');
				table.string('basfId');
				table.string('orcidId');
				table.string('username');
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
	return db('users').insert({
		username: 'TestTest',
		email: 'test@test.com',
		firstname: 'Test',
		lastname: 'Test',
		password,
	}, ['id']);
});