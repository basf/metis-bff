const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const { createAndSaveDataSource, getAndPrepareDataSources } = require('./_helpers');

module.exports = {
    get: [
        checkAuth,
        getUserDataSources,   
        get,
    ],
    post: [
        checkAuth,
        getUserDataSources,
        post,
    ],
};

async function post(req, res, next) {

    if (!req.body.content) {
        return next({ status: StatusCodes.BAD_REQUEST });
    } 

    res.status(202).json({});

    try {
        const contents = Array.isArray(req.body.content) ? req.body.content : [ req.body.content ];

        for (const content of contents) {
            const datasource = await createAndSaveDataSource(req.user.id, content);
            req.session.datasources.push(datasource);
        }

        const output = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo(output, 'datasources');
    } catch(error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

async function get(req, res, next) {

    res.status(202).json({});

    try {
        const output = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo(output, 'datasources');
    } catch(error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}