const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');
const { getTemplate } = require('../../../services/backend');

module.exports = {
    get: [checkAuth, getUserDataSources, get],
};

/**
 * @api {get} /v0/calculations/template Get calculation template to be overridden by a user
 * @apiName GetCalcTemplate
 * @apiGroup Calculations
 * @apiParam {Integer} id Datasource id
 * @apiParam {String} engine Supported engine
 * @apiPermission GUI_ONLY
 * @apiSuccess (200) [Object[]] template + its schema.
 */
async function get(req, res, next) {
    if (!req.query.id || !req.query.engine) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const result = req.session.datasources.data.find(({ id }) => id == req.query.id),
        uuid = result?.uuid;

    if (!uuid)
        return res
            .status(StatusCodes.FORBIDDEN)
            .json({ error: 'Sorry you cannot access this item' });

    try {
        const { data = {} } = await getTemplate(uuid, req.query.engine);

        res.header('Content-Type', 'application/json');
        return res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Sorry invalid data occured',
        });
    }
}
