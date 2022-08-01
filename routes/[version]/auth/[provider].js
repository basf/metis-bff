const passport = require('passport');

const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const OrcidStrategy = require('passport-orcid').Strategy;
const MPDSStrategy = require('./mpds');

//const OAuth2Strategy = require('passport-oauth2').Strategy;
//const DummyStrategy = require('../../../tests/oauth/strategy');

const {
    USERS_TABLE,
    USERS_OAUTHS_TABLE,
    selectFirstUser,
    upsertUser,
} = require('../../../services/db');

const { oauth } = require('../../../config');
const { sendVerifyEmail } = require('./_middlewares');

module.exports = {
    get: [
        (req, res, next) => {
            if (!req.session.redirectURL) {
                req.session.redirectURL = req.headers.origin || req.headers.referer;
                req.session.save();
            }
            passport.authenticate(req.params.provider)(req, res, next);
        },
        sendVerifyEmail,
        (req, res) => {
            const redirectURL = req.session.redirectURL;
            if (redirectURL) {
                delete req.session.redirectURL;
                req.session.save();
                res.redirect(redirectURL);
            }
        },
    ],
};

passport.use(new GitHubStrategy(oauth.github, handleCallback('github')));
passport.use(new LinkedInStrategy(oauth.linkedin, handleCallback('linkedin')));
passport.use(new OrcidStrategy(oauth.orcid, handleCallback('orcid')));
passport.use(new MPDSStrategy(oauth.mpds, handleCallback('mpds')));

//passport.use(new DummyStrategy(oauth.dummy, handleCallback('dummy')));

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
    return async (...args) => {
        let [done, profile, params] = args.reverse();

        if (!profile || !Object.keys(profile).length) {
            profile = params;
        }

        const providerId = provider === 'orcid' ? profile.orcid : profile.id;

        if (!profile || !providerId) return done(new Error('OAuth profile is incorrect'), null);

        const email = profile.email || (profile.emails.length && profile.emails[0].value) || '';
        let [firstName = '', lastName = ''] = (profile.displayName || profile.name || '').split(
            ' '
        );

        if (!firstName && !lastName) {

            firstName = profile.username || profile.login;

            if (provider === 'mpds') {
                firstName = profile.first_name;
                lastName = profile.last_name;
            }
        }

        try {
            const user = await selectFirstUser({
                [`${USERS_OAUTHS_TABLE}.provider`]: provider,
                [`${USERS_OAUTHS_TABLE}.providerId`]: providerId,
            });

            if (user) {
                done(null, user);

            } else {
                const inserted = await upsertUser({
                    firstName,
                    lastName,
                    email,
                    provider,
                    providerId,
                    profile,
                });

                const user = await selectFirstUser({ [`${USERS_TABLE}.id`]: inserted.id });
                done(null, user);
            }

        } catch (err) {
            done(err, null);
        }
    };
}
