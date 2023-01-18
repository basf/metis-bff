const { StatusCodes } = require('http-status-codes');

const { selectUserDataSources } = require('../../../../services/db');

const { checkAuth } = require('../../../../middlewares/auth');
const { getUserDataSources } = require('../../../../middlewares/db');
const { getDataSourceResult } = require('../../../../services/backend');
const { deleteAndClearDataSource, getAndPrepareDataSources } = require('../_helpers');

module.exports = {
    delete: [checkAuth, getUserDataSources, del],
    get: [checkAuth, getUserDataSources, get],
};

/**
 * @api {del} /v0/datasources/:id Delete a data entity
 * @apiName DeleteData
 * @apiGroup Data
 * @apiParam {Integer} id Datasource id
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function del(req, res, next) {
    if (!req.params.id) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        await deleteAndClearDataSource(req.user.id, req.params.id);

        req.session.datasources.data = req.session.datasources.data.filter(
            (datasource) => datasource.id !== req.params.id
        );

        if (req.session.datasources.data.length <= 1) {
            const page = +req.query.page <= 1 ? 1 : +req.query.page - 1;
            req.session.datasources = await selectUserDataSources(req.user, { ...req.query, page });
        }

        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, ...data }, 'datasources');

    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

/**
 * @api {get} /v0/datasources/:id Show a data entity
 * @apiName ShowData
 * @apiGroup Data
 * @apiParam {Integer} id Datasource id
 * @apiPermission API
 * @apiSuccess (200) Object data entity.
 */
async function get(req, res, next) {
    if (!req.params.id) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const result = req.session.datasources.data.find(({ id }) => id == req.params.id),
        uuid = result?.uuid;

    if (!uuid)
        return res
            .status(StatusCodes.FORBIDDEN)
            .json({ error: 'Sorry you cannot access this item' });

    try {
        const { data = {} } = await getDataSourceResult(uuid);

        res.header('Content-Type', 'application/json');
        return res.send(JSON.stringify(data, null, 4));

    } catch (error) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Sorry invalid data occured',
        });
    }
}
