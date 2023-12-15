const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');

const { USERS_TABLE, selectFirstUser, selectUserCollections } = require('../../../services/db');

const { getAndPrepareCollections } = require('../collections/_helpers');

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
        names = Array.isArray(req.body.name) ? req.body.name : [req.body.name],
        contents = Array.isArray(req.body.content) ? req.body.content : [req.body.content];

    if (contents.length !== names.length || (fmt && contents.length > 1)) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Input parameters are inconsistent.',
        });
    }

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        for (let i = 0; i < contents.length; i++) {
            const datasource = await createAndSaveDataSource(
                req.user.id,
                contents[i],
                fmt,
                names[i]
            );
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
    if (!req.body.id || !req.body.parent) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required fields are not provided.',
        });
    }

    const reqId = req.id;
    res.status(StatusCodes.ACCEPTED).json({ reqId });

    const datasource = await importAndSaveDataSource(req.user.id, req.body.id, req.body.parent);
    if (!datasource)
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Cannot import this entry',
        });

    req.session.datasources.data.push(datasource);
    const data = await getAndPrepareDataSources(req.session.datasources);

    res.sse.sendTo({ reqId, ...data }, 'datasources');

    const user = await selectFirstUser({ [`${USERS_TABLE}.id`]: req.user.id });
    const filters = await selectUserCollections(user);
    const preparedFilters = await getAndPrepareCollections(filters);

    res.sse.sendTo({ reqId, ...preparedFilters }, 'filters');
}
