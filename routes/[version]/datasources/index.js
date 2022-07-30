const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const { createAndSaveDataSource, getAndPrepareDataSources } = require('./_helpers');

module.exports = {
    get: [checkAuth, getUserDataSources, get],
    post: [checkAuth, getUserDataSources, post],
};

async function post(req, res, next) {
    if (!req.body.content) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required field `content` is not provided.',
        });
    }

    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const contents = Array.isArray(req.body.content) ? req.body.content : [req.body.content];

        for (const content of contents) {
            const datasource = await createAndSaveDataSource(req.user.id, content);
            req.session.datasources.push(datasource);
        }

        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, data }, 'datasources');

    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, data }, 'datasources');

    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
