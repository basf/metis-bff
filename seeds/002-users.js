const {
    USERS_TABLE,
    USER_ROLES_TABLE,
    DEFAULT_USER_ROLE,
    ADMIN_USER_ROLE,
    hashString,
} = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const password = hashString('123123');

    const roles = knex(USER_ROLES_TABLE);
    const memberRole = await roles.where('slug', DEFAULT_USER_ROLE).first();
    const adminRole = await roles.where('slug', ADMIN_USER_ROLE).first();

    // Deletes ALL existing entries
    await knex(USERS_TABLE).del();

    await knex(USERS_TABLE).insert(
        [
            {
                firstName: 'Test',
                lastName: 'Member',
                roleId: memberRole.id,
                password,
            },
            {
                firstName: 'Test',
                lastName: 'Admin',
                roleId: adminRole.id,
                password,
            },
            {
                firstName: 'Test',
                lastName: 'Test',
                roleId: memberRole.id,
                password,
            },
        ],
        ['id']
    );
};
