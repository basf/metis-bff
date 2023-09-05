const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const {
    createAndSaveDataSource,
    getAndPrepareDataSources,
    importAndSaveDataSource,
} = require('./_helpers');

module.exports = {
    get: [checkAuth, getUserDataSources, get],
    post: [checkAuth, getUserDataSources, post],
    put: [checkAuth, getUserDataSources, put],
};

/**
 * @api {post} /v0/datasources Create a data entity
 * @apiName CreateData
 * @apiGroup Data
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function post(req, res, next) {
    if (!req.body.content) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required field *content* is not provided.',
        });
    }

    const reqId = req.id,
        fmt = req.body.fmt || null,
        name = req.body.name || null;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const contents = Array.isArray(req.body.content) ? req.body.content : [req.body.content];

        for (const content of contents) {
            const datasource = await createAndSaveDataSource(req.user.id, content, fmt, name);
            req.session.datasources.data.push(datasource);
        }

        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, ...data }, 'datasources');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

/**
 * @api {get} /v0/datasources List all user's data entities
 * @apiName ListData
 * @apiGroup Data
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, ...data }, 'datasources');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

/**
 * @api {put} /v0/datasources Import datasource from an external provider DB
 * @apiName ImportData
 * @apiGroup Data
 * @apiPermission GUI_ONLY
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function put(req, res, next) {
    if (!req.body.id) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required field *id* is not provided.',
        });
    }

    const reqId = req.id;
    res.status(StatusCodes.ACCEPTED).json({ reqId });

    const datasource = await importAndSaveDataSource(req.user.id, req.body.id);
    if (!datasource)
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Cannot import this entry',
        });

    req.session.datasources.data.push(datasource);
    const data = await getAndPrepareDataSources(req.session.datasources);

    res.sse.sendTo({ reqId, ...data }, 'datasources');
}
