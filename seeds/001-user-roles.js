const { USER_ROLES_TABLE, DEFAULT_USER_ROLE, ADMIN_USER_ROLE } = require('../services/db');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex(USER_ROLES_TABLE).del();
    await knex(USER_ROLES_TABLE).insert(
        [
            {
                slug: DEFAULT_USER_ROLE,
                label: 'Member',
                permissions: {},
            },
            {
                slug: ADMIN_USER_ROLE,
                label: 'Admin',
                permissions: {},
            },
        ],
        ['id', 'slug']
    );
};
