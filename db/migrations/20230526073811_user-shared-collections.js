const {
    USERS_TABLE,
    USER_COLLECTIONS_TABLE,
    USER_SHARED_COLLECTIONS_TABLE,
    FOREIGN_KEY_LENGTH,
} = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_SHARED_COLLECTIONS_TABLE, (table) => {
        table.integer('collection_id', FOREIGN_KEY_LENGTH).unsigned().index();
        table.integer('user_id', FOREIGN_KEY_LENGTH).unsigned().index();
        table.jsonb('permissions').nullable();
        table.timestamps(false, true, false);

        table.primary(['user_id', 'collection_id'], {
            constraintName: 'pk_user_collection',
        });
        table
            .foreign('user_id', 'fk_user_id')
            .references('id')
            .inTable(USERS_TABLE)
            .onDelete('CASCADE');
        table
            .foreign('collection_id', 'fk_collection_id')
            .references('id')
            .inTable(USER_COLLECTIONS_TABLE)
            .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USER_SHARED_COLLECTIONS_TABLE);
};
