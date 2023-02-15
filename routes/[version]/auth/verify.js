const { db, USERS_EMAILS_TABLE } = require('../../../services/db');

module.exports = {
    get,
};

/**
 * @api {get} /v0/auth/verify Verify user's email
 * @apiName VerifyEmail
 * @apiGroup Users
 * @apiPermission GUI_ONLY
 * @apiSuccess (200) String message.
 */
async function get(req, res, next) {
    const { redirectURL, code } = req.query;

    if (code) {
        const updated = await db(USERS_EMAILS_TABLE)
            .where({ code })
            .update({ verified: true }, ['userId']);

        const verified = updated && updated[0] && !!updated[0].userId;

        if (verified) {
            redirectURL
                ? res.redirect(redirectURL)
                : res.send('Your email was successfully verified');
        } else {
            res.send('Verification failed');
        }
    }
}
