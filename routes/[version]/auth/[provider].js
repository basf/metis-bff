const passport = require('passport');

const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const OrcidStrategy = require('passport-orcid').Strategy;

const MPDSStrategy = require('./mpds');
const BASFStrategy = require('./basf');

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
///const { sendCustomWebHook } = require('./custom_webhook'); // TODO custom MPDS webhook

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
passport.use(new BASFStrategy(oauth.basf, handleCallback('basf')));

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

        if (!profile) return done(new Error('OAuth profile is incorrect'), null);

        let providerId,
            firstName,
            lastName,
            email = profile.email || (profile.emails.length && profile.emails[0].value) || '';

        // TODO email should not be allowed empty!

        if (provider === 'orcid') {
            providerId = profile.orcid;

        } else if (provider === 'basf') {
            providerId = profile.sub;

        } else {
            providerId = profile.id;
        }

        if (!providerId) return done(new Error('OAuth profile is empty'), null);

        if (provider === 'mpds') {
            firstName = profile.first_name;
            lastName = profile.last_name;

        } else if (provider === 'basf') {
            firstName = profile.given_name;
            lastName = profile.family_name;

        } else {
            [firstName = '', lastName = ''] = (profile.displayName || profile.name || '').split(' ');
        }

        if (!firstName) {
            firstName = profile.username || profile.login || 'Member';
        }
        if (!lastName) {
            lastName = 'from ' + provider;
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

                ///if (provider === 'mpds') sendCustomWebHook(user.id, user.email); // TODO custom MPDS webhook
            }

        } catch (err) {
            done(err, null);
        }
    };
}
