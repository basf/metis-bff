const { selectLogs } = require('../../services/db');

module.exports = {
    get,
};

async function get(req, res, next) {
    const q = req.query;
    const opts = {
        limit: q.limit && parseInt(q.limit),
        offset: q.offset && parseInt(q.offset),
        type: q.type,
        userIds: q.user_ids?.split(','),
    };
    const logs = await selectLogs(opts);
    return res.json(logs);
}
