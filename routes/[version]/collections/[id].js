const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');
const { deleteUserCollection } = require('../../../services/db');


module.exports = {
    delete: [
        checkAuth,
        getUserCollections,
        del,
    ],
};

async function del(req, res, next) {

    res.status(StatusCodes.ACCEPTED).json({});

    try {
        const collection = await deleteUserCollection(req.user.id, req.params.id);

        if (collection) {
            req.session.collections = req.session.collections.filter(({ id }) => id !== collection.id);
        }

        res.sse.sendTo(req.session.collections, 'collections');
    } catch(error) {
        return next({ error });
    } 
}