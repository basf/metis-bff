const { StatusCodes } = require('http-status-codes');

module.exports = {
    checkAuth,
};

async function checkAuth(req, res, next) {
    if (!req.user) {
        return next({ status: StatusCodes.UNAUTHORIZED, error: 'Need to authorize first'  });
    }
    return next();
}