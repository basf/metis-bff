const { COLLECTIONS_TYPES_TABLE, NAME_LENGTH, FLAVORS_ENUM } = require('../../services/db');

const FLAVORS_ENUM_NAME = 'collection_flavors';

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
            enumName: FLAVORS_ENUM_NAME,
        });
        table.timestamps(false, true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(COLLECTIONS_TYPES_TABLE).raw(`drop type ${FLAVORS_ENUM_NAME}`);
};
