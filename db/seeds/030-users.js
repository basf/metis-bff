const {
    USERS_TABLE,
    USER_ROLES_TABLE,
    DEFAULT_USER_ROLE,
    ADMIN_USER_ROLE,
    hashString,
    USERS_EMAILS_TABLE,
} = require('../../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const password = hashString('123123');

    const memberRole = await knex(USER_ROLES_TABLE).where('slug', DEFAULT_USER_ROLE).first();
    const adminRole = await knex(USER_ROLES_TABLE).where('slug', ADMIN_USER_ROLE).first();

    // Deletes ALL existing entries
    await knex(USERS_TABLE).del();

    const [member, admin, test] = await knex(USERS_TABLE).insert(
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

    // Deletes ALL existing entries
    await knex(USERS_EMAILS_TABLE).del();

    const memberEmail = 'member@test.com';
    const adminEmail = 'admin@test.com';
    const testEmail = 'test@test.com';

    const code1 = await hashString(memberEmail);
    const code2 = await hashString(adminEmail);
    const code3 = await hashString(testEmail);

    await knex(USERS_EMAILS_TABLE).insert([
        {
            userId: member.id,
            email: memberEmail,
            code: code1,
        },
        {
            userId: admin.id,
            email: adminEmail,
            code: code2,
        },
        {
            userId: test.id,
            email: testEmail,
            code: code3,
        },
    ]);
};
