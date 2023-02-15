const { getEngines } = require('../../../services/backend');

module.exports = {
    get,
};

/**
 * @api {get} /v0/calculations/engines Get calculation engines supported
 * @apiName GetCalcEngines
 * @apiGroup Calculations
 * @apiPermission unprotected
 * @apiSuccess (200) [Object[]] engines info.
 */
async function get(req, res, next) {
    try {
        const output = await getEngines();
        res.json(output.data);
    } catch (error) {
        return next({ error });
    }
}
