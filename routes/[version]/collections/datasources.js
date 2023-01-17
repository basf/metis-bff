const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const { getAndPrepareDataSources } = require('../datasources/_helpers');

module.exports = {
    get: [checkAuth, getUserDataSources, get],
};

/**
 * @api {get} /v0/collections/datasources List all user's collections via datasource
 * @apiName ListCollectionData
 * @apiGroup Collections
 * @apiPermission GUI_ONLY
 */
async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, ...data }, 'collectionDataSources');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
