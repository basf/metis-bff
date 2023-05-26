const { COLLECTIONS_TYPES_TABLE } = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex(COLLECTIONS_TYPES_TABLE).del();
    await knex(COLLECTIONS_TYPES_TABLE).insert(
        [
            {
                slug: 'red',
                label: 'Red',
                flavor: 'red',
            },
            {
                slug: 'blue',
                label: 'Blue',
                flavor: 'blue',
            },
            {
                slug: 'green',
                label: 'Green',
                flavor: 'green',
            },
            {
                slug: 'orange',
                label: 'Orange',
                flavor: 'orange',
            },
        ],
        ['id', 'slug']
    );
};
