const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { StatusCodes } = require('http-status-codes');

const { USERS_TABLE, USERS_EMAILS_TABLE, selectFirstUser, compareStringHash, upsertUser } = require('../../../services/db');
const { checkAuth } = require('../../../middlewares/auth');

const { sendVerifyEmail } = require('./_middlewares');

const privateFields = ['password', 'emailCode', 'roleId'];

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, email, password, done) => {

        try {
            const user = await selectFirstUser({ [`${USERS_EMAILS_TABLE}.email`]: email });
            const match = user ? await compareStringHash(password, user.password) : false;

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
    put: [
        checkAuth,
        put,
        sendVerifyEmail,
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
        if (!privateFields.includes(key)) dto[key] = val;
        return dto;
    }, {});

    return res.json(userDTO);
}

async function put(req, res, next) {

    try {
        const upserted = await upsertUser({ ...req.body, id: req.user.id });

        if (!upserted) {
            return next({ error: 'User not updated' });
        }

        req.user = await selectFirstUser({ [`${USERS_TABLE}.id`]: req.user.id });

    } catch(error) {
        return next({ error });
    }

    return next();
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