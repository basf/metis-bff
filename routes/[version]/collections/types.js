const { selectCollectionTypes } = require('../../../services/db');

module.exports = {
    get,
};

async function get(req, res, next) {
    try {
        const output = await selectCollectionTypes();
        res.json(output);
    } catch (error) {
        return next({ error });
    }
}
