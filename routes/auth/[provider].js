const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const OrcidStrategy = require('passport-orcid').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;

const { db, tnames } = require('../../services/db');
const { oauth } = require('../../config');

module.exports = {
    get: [
        (req, res, next) => {
            if ( ! req.session.redirectURL) {
                req.session.redirectURL = req.headers.origin || req.headers.referer;
                req.session.save();
            }
            passport.authenticate(req.params.provider)(req, res, next);
        },
        (req, res) => {
            const redirectURL = req.session.redirectURL;
            if (redirectURL) {
                delete req.session.redirectURL;
                req.session.save();
                res.redirect(redirectURL);
            }
        }
    ]
};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await db(tnames.table_users).where('id', id).first();
        done(null, user);
    } catch(err) {
        done(err, null);
    }
});

passport.use(new GitHubStrategy(oauth.github, handleCallback('github')));
passport.use(new LinkedInStrategy(oauth.linkedin, handleCallback('linkedin')));
passport.use(new OrcidStrategy(oauth.orcid, handleCallback('orcid')));

function handleCallback(provider) {
    /**
     * @param {string} accessToken
     * @param {string} refreshToken
     * @param {Object} profile
     * @param {Function} done
     *
     * @also
     *
     * @param {string} accessToken
     * @param {string} refreshToken
     * @param {Object} params
     * @param {Object} profile
     * @param {Function} done
    */
    return async (accessToken, refreshToken, ...tail) => {

        let [ done, profile, params ] = tail.reverse();

        if (!profile || !Object.keys(profile).length) {
            profile = params;
        }

        console.log('oauth profile', profile);

        if ( ! profile || ! profile.id) return done(new Error('OAuth profile is incorrect'), null);

        const providerId = profile.id;
        const username = profile.displayName || profile.username || null;
        const email = profile.email || (profile.emails.length && profile.emails[0].value) || null;

        try {
            const user = await db(tnames.table_users).where(`${provider}Id`, providerId).first();

            if (user) {
                done(null, user);
            } else {
                const inserted = await db(tnames.table_users).insert({
                    profile: JSON.stringify(profile),
                    [`${provider}Id`]: providerId,
                    username,
                    email,
                }, ['id']);

                const user = await db(tnames.table_users).where('id', inserted[0].id).first();

                done(null, user);
            }
        } catch(err) {
            done(err, null);
        }
    };
}