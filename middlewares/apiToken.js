const passport = require('passport');
const Strategy = require('passport-http-bearer');
const { StatusCodes } = require('http-status-codes');

const { selectUserByApiToken } = require('../services/db');

passport.use(
    new Strategy(async (token, done) => {
        try {
            const user = await selectUserByApiToken(token);
            if (user) {
                done(null, user);
            } else {
                done({ status: StatusCodes.UNAUTHORIZED, error: 'Authentication failed' }, null);
            }
        } catch (err) {
            done(err, null);
        }
    })
);

function middleware(req, res, next) {
    if (hasAuthBearerHeader(req)) {
        return passport.authenticate('bearer', { session: false }, (error, user) => {
            if (error) {
                return next(error);
            }
            req.user = user;
            return next();
        })(req, res, next);
    }
    return next();
}

function hasAuthBearerHeader(req) {
    return Boolean(req.headers?.authorization?.toLowerCase().startsWith('bearer'));
}

module.exports = {
    middleware,
    hasAuthBearerHeader,
};
