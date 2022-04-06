module.exports = function (req, res, next) {
    res.sse.sendTo = function(...args) {
        req.session.save(() => {
            this.send(({ session }) => {
                return req.user && session.passport && req.user.id === session.passport.user;
            }, ...args);
        });
    };

    return next();
};