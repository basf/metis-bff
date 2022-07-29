const { getEngines } = require('../../../services/backend');

module.exports = {
    get,
};

async function get(req, res, next) {
    try {
        const output = await getEngines();
        res.json(output.data);
    } catch (error) {
        return next({ error });
    }
}
