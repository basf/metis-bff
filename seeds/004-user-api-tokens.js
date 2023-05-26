const { USER_API_TOKENS_TABLE, USERS_EMAILS_TABLE } = require('../services/db');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const emails = await knex(USERS_EMAILS_TABLE);

    // Deletes ALL existing entries
    await knex(USER_API_TOKENS_TABLE).del();
    await knex(USER_API_TOKENS_TABLE).insert(
        emails.map(({ userId, email }) => ({
            userId,
            token: email, // inserting email as token just for test
        }))
    );
};
