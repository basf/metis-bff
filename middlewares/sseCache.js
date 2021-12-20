const cache = require('../services/sseCache');

module.exports = function (req, res, next) {
    if (req.user && res.sse) {
        cache.set(req.user.id, res.sse);
    }

    return next();
};
