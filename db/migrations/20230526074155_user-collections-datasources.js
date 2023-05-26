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
        table.integer('collectionId').unsigned().index();
        table.integer('dataSourceId').unsigned().index();
        table.timestamps(false, true, true);

        table.primary(['collectionId', 'dataSourceId'], {
            constraintName: 'pk_collection_dataSource',
        });
        table
            .foreign('collectionId', 'fk_collectionId')
            .references('id')
            .inTable(USER_COLLECTIONS_TABLE)
            .onDelete('CASCADE');
        table
            .foreign('dataSourceId', 'fk_dataSourceId')
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
