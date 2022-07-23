const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserCollections } = require('../../../middlewares/db');

module.exports = {
    get: [checkAuth, getUserCollections, get],
};

async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = req.session.collections;
        res.sse.sendTo({ reqId, ...data }, 'filters');
    } catch (error) {
        return next({ error });
    }
}
