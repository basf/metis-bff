const {
    USERS_TABLE,
    USER_COLLECTIONS_TABLE,
    USER_SHARED_COLLECTIONS_TABLE,
    FOREIGN_KEY_LENGTH,
} = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_SHARED_COLLECTIONS_TABLE, (table) => {
        table.integer('collectionId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
        table.jsonb('permissions').nullable();
        table.timestamps(false, true, true);

        table.primary(['userId', 'collectionId'], {
            constraintName: 'pk_user_collection',
        });
        table
            .foreign('userId', 'fk_userId')
            .references('id')
            .inTable(USERS_TABLE)
            .onDelete('CASCADE');
        table
            .foreign('collectionId', 'fk_collectionId')
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
