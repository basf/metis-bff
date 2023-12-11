const { COLLECTIONS_TYPES_TABLE } = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex(COLLECTIONS_TYPES_TABLE).del();
    await knex(COLLECTIONS_TYPES_TABLE).insert([
        {
            // id = 1
            slug: 'requests',
            label: 'Requests',
            flavor: '#900',
        },
        {
            // id = 2
            slug: 'samples',
            label: 'Samples',
            flavor: '#ccc',
        },
        {
            // id = 3
            slug: 'statuses',
            label: 'Statuses',
            flavor: '#f5f5f5',
        },
        {
            // id = 4
            slug: 'phases',
            label: 'Materials',
            flavor: '#666',
        },
        {
            // id = 5
            slug: 'customers',
            label: 'Customers',
            flavor: '#5755D9',
        },
        // TODO datasource type
    ]);
};
