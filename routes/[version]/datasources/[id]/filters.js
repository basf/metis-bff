const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../../middlewares/auth');
const { getUserCollections } = require('../../../../middlewares/db');
const { delsertDataSourceCollections } = require('../../../../services/db');

module.exports = {
    patch: [
        checkAuth,
        patch,
        getUserCollections,
        (req, res) =>
            res.sse.sendTo({ reqId: req.id, ...req.session.collections }, 'filters'),
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
