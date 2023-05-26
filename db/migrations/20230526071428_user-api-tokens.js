const { USERS_TABLE, USER_API_TOKENS_TABLE, FOREIGN_KEY_LENGTH } = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_API_TOKENS_TABLE, (table) => {
        table.increments('id');
        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.string('token').unique();
        table.timestamps(false, true, true);

        table.primary('id', { constraintName: 'pk_user_api_token' });
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
    return knex.schema.dropTable(USER_API_TOKENS_TABLE);
};
