const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../../middlewares/auth');
const { getUserCollections } = require('../../../../middlewares/db');
const { delsertDataSourceCollections } = require('../../../../services/db');
const { getAndPrepareCollections } = require('../../collections/_helpers');

module.exports = {
    patch: [
        checkAuth,
        patch,
        getUserCollections,
        sendToSse
    ],
};

async function patch(req, res, next) {
    const reqId = req.id;
    res.status(StatusCodes.ACCEPTED).json({ reqId });
    try {
        await delsertDataSourceCollections(req.params.id, req.body);
        return next();
    } catch (error) {
        return next({ error });
    }
}

async function sendToSse(req, res) {
    const reqId = req.id;
    const data = await getAndPrepareCollections(req.session.collections);
    res.sse.sendTo({ reqId, ...data }, 'filters');
}
