const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');
const { deleteUserCollection } = require('../../../services/db');

module.exports = {
    delete: [checkAuth, getUserCollections, del],
};

/**
 * @api {del} /v0/collections/:id Remove a collection
 * @apiName RemoveCollection
 * @apiGroup Collections
 * @apiParam {Integer} id Collection id
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function del(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const collection = await deleteUserCollection(req.user.id, req.params.id);

        if (collection) {
            req.session.collections.data = req.session.collections.data.filter(
                ({ id }) => id !== collection.id
            );
        }

        res.sse.sendTo({ reqId, ...req.session.collections }, 'collections');
    } catch (error) {
        return next({ error });
    }
}
