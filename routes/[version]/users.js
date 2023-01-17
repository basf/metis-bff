const { StatusCodes } = require('http-status-codes');
const { searchUsers, selectUsersByIds } = require('../../services/db');

module.exports = {
    get,
};

/**
 * @api {get} /v0/users Get users by criteria
 * @apiName SearchUsers
 * @apiGroup Users
 * @apiDescription This endpoint is used solely for the data sharing suggestions in GUI
 * @apiPermission GUI_ONLY
 */
async function get(req, res, next) {
    if (!req.query.search && !req.query.ids) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Need to provide some search string or ids list to reduce selection',
        });
    }

    let users = [];

    if (req.query.search) {
        users = await searchUsers(req.query.search, req.query.limit);
    } else {
        if (!Array.isArray(req.query.ids)) {
            req.query.ids = req.query.ids.split(',');
        }
        users = await selectUsersByIds(req.query.ids);
    }

    return res.json(users);
}
