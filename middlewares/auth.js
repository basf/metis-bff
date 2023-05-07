const { StatusCodes } = require('http-status-codes');

module.exports = {
    checkAuth,
};

async function checkAuth(req, res, next) {
    //console.log('check auth for', req.method, req.path, typeof req.user, req.headers.cookie);

    if (!req.user) {
        return next({ status: StatusCodes.UNAUTHORIZED, error: 'Need to authorize first' });
    }
    return next();
}
