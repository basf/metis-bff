const {
    USERS_TABLE,
    USER_ROLES_TABLE,
    NAME_LENGTH,
    PASSWORD_LENGTH,
    FOREIGN_KEY_LENGTH,
} = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USERS_TABLE, (table) => {
        table.increments('id');
        table.string('password', PASSWORD_LENGTH).nullable();
        table.string('firstName', NAME_LENGTH);
        table.string('lastName', NAME_LENGTH);
        table.integer('roleId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.timestamps(false, true, true);

        table
            .foreign('roleId', 'fk_roleId')
            .references('id')
            .inTable(USER_ROLES_TABLE)
            .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USERS_TABLE);
};
