const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserDataSources } = require('../../../middlewares/db');
const { runPI } = require('../../../services/backend');

module.exports = {
    post: [checkAuth, getUserDataSources, post],
};

/**
 * @api {post} /v0/calculations/phaseid Run phase identification
 * @apiName RunPhaseID
 * @apiGroup Calculations
 * @apiParam {Integer} id Target datasource id
 * @apiParam {String} els Chemical elements and groups, merged in a string
 * @apiParam {Boolean} strict Whether to allow other chemical elements
 * @apiPermission API
 * @apiSuccess (200) [Object[]] results.
 */
async function post(req, res, next) {
    if (!req.body.id || !req.body.els) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const result = req.session.datasources.data.find(({ id }) => id == req.body.id),
        uuid = result?.uuid;

    if (!uuid)
        return res
            .status(StatusCodes.FORBIDDEN)
            .json({ error: 'Sorry you cannot access this item' });

    try {
        const { data = {} } = await runPI(uuid, req.body.els, req.body.strict);

        res.header('Content-Type', 'application/json');
        return res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Sorry invalid data occured',
        });
    }
}
