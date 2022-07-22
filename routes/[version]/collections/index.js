const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');
const { getAndPrepareCollections, saveCollection } = require('./_helpers');

module.exports = {
    get: [checkAuth, getUserCollections, get],
    put: [checkAuth, getUserCollections, put],
};

async function put(req, res, next) {
    if (!req.body.typeId || !req.body.title) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required fields `typeId` and `title` are not provided.',
        });
    }

    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const collection = await saveCollection(req.user, req.body);

        const i = req.session.collections.data.findIndex(({ id }) => id === collection.id);

        if (i < 0) {
            req.session.collections.data.push(collection);
        } else {
            req.session.collections.data[i] = collection;
        }

        res.sse.sendTo({ reqId, ...req.session.collections }, 'collections');
    } catch (error) {
        return next({ error });
    }
}

async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareCollections(req.session.collections);

        res.sse.sendTo({ reqId, ...data }, 'collections');
    } catch (error) {
        return next({ error });
    }
}
