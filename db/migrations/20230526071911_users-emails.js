const {
    USERS_TABLE,
    USERS_EMAILS_TABLE,
    FOREIGN_KEY_LENGTH,
    PASSWORD_LENGTH,
    EMAIL_LENGTH,
} = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USERS_EMAILS_TABLE, (table) => {
        table.integer('user_id', FOREIGN_KEY_LENGTH).unsigned().index();
        table.string('email', EMAIL_LENGTH).unique().index();
        table.string('code', PASSWORD_LENGTH).unique().index();
        table.boolean('verified').defaultTo(false);
        table.timestamps(false, true, true);

        table.primary(['user_id', 'email'], { constraintName: 'pk_user_email' });
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
    return knex.schema.dropTable(USERS_EMAILS_TABLE);
};
