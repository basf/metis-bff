const { USER_ROLES_TABLE, NAME_LENGTH } = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_ROLES_TABLE, (table) => {
        table.increments('id');
        table.string('slug', NAME_LENGTH).unique();
        table.string('label', NAME_LENGTH);
        table.jsonb('permissions').nullable();
        table.timestamps(false, true, false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USER_ROLES_TABLE);
};
