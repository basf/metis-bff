const { StatusCodes } = require('http-status-codes');
const { checkAuth } = require('../../middlewares/auth');
const { selectLogs, selectUserRole } = require('../../services/db');

module.exports = {
    get: [checkAuth, get],
};

async function get(req, res, next) {
    const role = await selectUserRole(req.user.id);
    if (role.slug !== 'admin') {
        return next({
            status: StatusCodes.FORBIDDEN,
            error: 'Access for admin only',
        });
    }

    const q = req.query;
    const opts = {
        limit: q.limit && parseInt(q.limit),
        offset: q.offset && parseInt(q.offset),
        type: q.type,
        userIds: q.user_ids?.split(',').map((id) => parseInt(id)),
        after: q.after && new Date(parseInt(q.after) * 1000),
    };
    const logs = await selectLogs(opts);
    return res.json(logs);
}
