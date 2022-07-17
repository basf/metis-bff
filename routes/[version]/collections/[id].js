const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');
const { deleteUserCollection } = require('../../../services/db');

module.exports = {
    delete: [checkAuth, getUserCollections, del],
};

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

        res.sse.sendTo({ reqId, data: req.session.collections }, 'collections');
    } catch (error) {
        return next({ error });
    }
}
