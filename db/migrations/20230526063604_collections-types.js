const { COLLECTIONS_TYPES_TABLE, NAME_LENGTH, FLAVORS_ENUM } = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(COLLECTIONS_TYPES_TABLE, (table) => {
        table.increments('id');
        table.string('slug', NAME_LENGTH).unique();
        table.string('label', NAME_LENGTH);
        table.enu('flavor', FLAVORS_ENUM, {
            useNative: true,
            enumName: 'collection_flavors',
        });
        table.timestamps(false, true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(COLLECTIONS_TYPES_TABLE);
};
