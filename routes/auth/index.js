const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { StatusCodes } = require('http-status-codes');

const { db, comparePasswords } = require('../../services/db');
const { checkAuth } = require('../../middlewares/auth');

const publicFields = ['id', 'username', 'email', 'firstname', 'lastname'];

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, email, password, done) => {

        try {
            const user = await db(tnames.table_users).where({ email }).first();
            const match = user ? await comparePasswords(password, user.password) : false;

            if (user && match) {
                done(null, user);
            } else {
                done(new Error('Bad credentials'), null);
            }
        } catch(err) {
            done(err, null);
        }
    })
);

module.exports = {
    get: [
        checkAuth,
        get,
    ],
    post: [
        passport.authenticate('local'),
        post,
    ],
    delete: del,
};


async function get(req, res, next) {
    const userDTO = Object.entries(req.user).reduce((dto, [ key, val ]) => {
        if (publicFields.includes(key)) dto[key] = val;
        return dto;
    }, {});

    return res.json(userDTO);
}

async function post(req, res, next) {
    if (!req.user) {
        return next({ status: StatusCodes.BAD_REQUEST, error: 'Bad credentials' });
    }
    return res.status(StatusCodes.NO_CONTENT).end();
}

async function del(req, res) {
    req.logout();
    return res.status(StatusCodes.NO_CONTENT).end();
}