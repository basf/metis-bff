const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { db, comparePasswords } = require('../../services/db');

const publicFields = ['id', 'username', 'email', 'firstname', 'lastname'];

passport.use(
	new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, email, password, done) => {

        try {
            const user = await db('users').where({ email }).first();
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
    get,
    post: [
        passport.authenticate('local'),
        post,
    ],
    delete: del,
};


async function get(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    const userDTO = Object.entries(req.user).reduce((dto, [ key, val ]) => {
        if (publicFields.includes(key)) dto[key] = val;
        return dto;
    }, {});

    return res.json(userDTO);
}

async function post(req, res) {
    if (!req.user) {
        return res.status(400).json({ error: 'Bad credentials' });
    }
    return res.status(204).end();
}

async function del(req, res) {
    req.logout();
    return res.status(204).end();
}