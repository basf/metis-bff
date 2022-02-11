module.exports = function (req, res, next) {
    res.sse.sendTo = res.sse.send.bind(res.sse, ({ session }) => {
        return req.user && session.passport && req.user.id === session.passport.user;
    });

    return next();
};
