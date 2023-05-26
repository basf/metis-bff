const {
    USERS_TABLE,
    USER_COLLECTIONS_TABLE,
    FOREIGN_KEY_LENGTH,
    VISIBILITY_ENUM,
    COLLECTIONS_TYPES_TABLE,
} = require('../../services/db');

const VISIBILITY_ENUM_NAME = 'collection_visibility';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_COLLECTIONS_TABLE, (table) => {
        table.increments('id');
        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.integer('typeId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.string('title', 32);
        table.string('description', 64);
        table
            .enu('visibility', VISIBILITY_ENUM, {
                useNative: true,
                enumName: VISIBILITY_ENUM_NAME,
            })
            .defaultTo(VISIBILITY_ENUM[0]);
        table.timestamps(false, true, true);

        table
            .foreign('userId', 'fk_userId')
            .references('id')
            .inTable(USERS_TABLE)
            .onDelete('CASCADE');
        table
            .foreign('typeId', 'fk_typeId')
            .references('id')
            .inTable(COLLECTIONS_TYPES_TABLE)
            .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USER_COLLECTIONS_TABLE).raw(`drop type ${VISIBILITY_ENUM_NAME}`);
};
