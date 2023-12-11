const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');

const { changeOwnership } = require('./_helpers');

module.exports = {
    post: [checkAuth, post],
};

/**
 * @api {post} /v0/collections/ownership Get data into work and change ownership (experimental)
 * @apiName ListCollectionData
 * @apiGroup Collections
 * @apiPermission GUI_ONLY
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function post(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        changeOwnership(req.body.collectionId, req.user.id);
        res.sse.sendTo({ reqId, data: [] }, 'collections');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
