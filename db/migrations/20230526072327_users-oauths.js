const {
    USERS_TABLE,
    USERS_OAUTHS_TABLE,
    OAUTH_PROVIDERS_ENUM,
    FOREIGN_KEY_LENGTH,
} = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USERS_OAUTHS_TABLE, (table) => {
        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.enu('provider', OAUTH_PROVIDERS_ENUM, {
            useNative: true,
            enumName: 'oauth_providers',
        });
        table.string('providerId').unique();
        table.jsonb('profile').nullable();
        table.timestamps(false, true, true);

        table.primary(['userId', 'provider'], {
            constraintName: 'pk_user_provider',
        });
        table
            .foreign('userId', 'fk_userId')
            .references('id')
            .inTable(USERS_TABLE)
            .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USERS_OAUTHS_TABLE);
};
