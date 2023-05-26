// Update with your config settings.

const { db } = require('./config');
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    production: {
        ...db,
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};
