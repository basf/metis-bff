const { selectCollectionTypes } = require('../../../services/db');

module.exports = {
    get,
};

/**
 * @api {get} /collections/types List all user's collection types
 * @apiName ListCollectionTypes
 * @apiGroup Collections
 * @apiDeprecated currently not used
 */
async function get(req, res, next) {
    try {
        const output = await selectCollectionTypes();
        res.json(output);
    } catch (error) {
        return next({ error });
    }
}
