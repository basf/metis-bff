
const util = require('util');
const OAuth2Strategy = require('passport-oauth2').Strategy;

function Strategy(options = {}, verify) {
    OAuth2Strategy.call(this, options, verify);
    this.name = 'mpds';
    this._userProfileURL = options.userProfileURL;
    this._oauth2.useAuthorizationHeaderforGET(false);
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = async function (accessToken, done) {
    this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
        if (err) {
            if (err.data) {
                try {
                    json = JSON.parse(err.data);
                } catch (_) { }
            }
            if (json && json.message) {
                return done(new APIError(json.message));
            }
            return done(new OAuth2Strategy.InternalOAuthError('Failed to fetch user profile', err));
        }
        try {
            return done(null, JSON.parse(body));
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }
    });
};

module.exports = Strategy;
