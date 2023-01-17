const { getEngines } = require('../../../services/backend');

module.exports = {
    get,
};

/**
 * @api {get} /calculations/engines Get yascheduler engines supported
 * @apiName GetYaEngines
 * @apiGroup Calculations
 * @apiPermission unprotected
 */
async function get(req, res, next) {
    try {
        const output = await getEngines();
        res.json(output.data);
    } catch (error) {
        return next({ error });
    }
}
