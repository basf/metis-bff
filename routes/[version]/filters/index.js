const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');
const { getAndPrepareCollections } = require('../collections/_helpers');

module.exports = {
    get: [checkAuth, getUserCollections, get],
};

/**
 * @api {get} /filters List all user's collections
 * @apiName ListAllCollections
 * @apiGroup Collections
 * @apiDescription This endpoint is used for unconditional extracting of all the collections
 * @apiPermission GUI_ONLY
 */
async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareCollections(req.session.collections);
        res.sse.sendTo({ reqId, ...data }, 'filters');
    } catch (error) {
        return next({ error });
    }
}
