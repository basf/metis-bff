const { hasAuthBearerHeader } = require('./apiToken');

module.exports = function (req, res, next) {
    function filterUser({ session, user }) {
        const userId = session?.passport?.user || user?.id;
        return req.user && req.user.id === userId;
    }

    res.sse.sendTo = function (...args) {
        if (hasAuthBearerHeader(req)) {
            this.send(filterUser, ...args);
        } else {
            req.session.save(() => {
                this.send(filterUser, ...args);
            });
        }
    };

    return next();
};
