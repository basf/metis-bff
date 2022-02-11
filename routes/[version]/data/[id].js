const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const { deleteAndClearDataSource, getAndPrepareDataSources } = require('./_helpers');

module.exports = {
    delete: [
        checkAuth,
        getUserDataSources,
        del,
    ],
};

async function del(req, res, next) {

    if (!req.params.id) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(202).json({});

    try {
        await deleteAndClearDataSource(req.user.id, req.params.id);

        const output = await getAndPrepareDataSources(req.session.datasources);
    
        res.sse.sendTo(output, 'datasources');
    } catch(error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    } 
}