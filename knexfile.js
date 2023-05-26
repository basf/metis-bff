// Update with your config settings.

const { db } = require('./config');
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        ...db,
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: './db/seeds',
        },
    },
};
