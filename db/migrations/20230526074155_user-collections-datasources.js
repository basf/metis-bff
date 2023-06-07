const {
    USER_COLLECTIONS_DATASOURCES_TABLE,
    USER_COLLECTIONS_TABLE,
    USER_DATASOURCES_TABLE,
} = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(USER_COLLECTIONS_DATASOURCES_TABLE, (table) => {
        table.integer('collection_id').unsigned().index();
        table.integer('data_source_id').unsigned().index();
        table.timestamps(false, true, false);

        table.primary(['collection_id', 'data_source_id'], {
            constraintName: 'pk_collection_data_source',
        });
        table
            .foreign('collection_id', 'fk_collection_id')
            .references('id')
            .inTable(USER_COLLECTIONS_TABLE)
            .onDelete('CASCADE');
        table
            .foreign('data_source_id', 'fk_data_source_id')
            .references('id')
            .inTable(USER_DATASOURCES_TABLE)
            .onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(USER_COLLECTIONS_DATASOURCES_TABLE);
};
