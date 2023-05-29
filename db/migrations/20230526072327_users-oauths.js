const {
    USERS_TABLE,
    USERS_OAUTHS_TABLE,
    OAUTH_PROVIDERS_ENUM,
    FOREIGN_KEY_LENGTH,
} = require('../../services/db');

const OAUTH_PROVIDERS_ENUM_NAME = 'oauth_providers';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USERS_OAUTHS_TABLE, (table) => {
        table.integer('user_id', FOREIGN_KEY_LENGTH).unsigned().index();
        table.enu('provider', OAUTH_PROVIDERS_ENUM, {
            useNative: true,
            enumName: OAUTH_PROVIDERS_ENUM_NAME,
        });
        table.string('provider_id').unique();
        table.jsonb('profile').nullable();
        table.timestamps(false, true, true);

        table.primary(['user_id', 'provider'], {
            constraintName: 'pk_user_provider',
        });
        table
            .foreign('user_id', 'fk_user_id')
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
    return knex.schema.dropTable(USERS_OAUTHS_TABLE).raw(`drop type ${OAUTH_PROVIDERS_ENUM_NAME}`);
};
