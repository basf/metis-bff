const util = require('util');
const OAuth2Strategy = require('passport-oauth2').Strategy;

function Strategy(options = {}, verify) {
    // options = {
    //     authorizationURL: 'http://localhost:3001/',
    //     tokenURL: 'http://localhost:3001/token',
    //     clientID: 'basf',
    //     clientSecret: 'basf',
    //     callbackURL: 'http://localhost:3000/v0/auth/basf',
    // };
    OAuth2Strategy.call(this, options, verify);
    this.name = options.name || 'basf';
    this._userProfileURL = options.userProfileURL || 'http://localhost:3001/userinfo';
    this._oauth2.useAuthorizationHeaderforGET(true);
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = async function (accessToken, done) {
    this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
        if (err) {
            if (err.data) {
                try {
                    json = JSON.parse(err.data);
                } catch (_) {}
            }
            if (json && json.message) {
                return done(new APIError(json.message));
            }
            return done(new InternalOAuthError('Failed to fetch user profile', err));
        }
        try {
            return done(null, JSON.parse(body));
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }
    });
};

module.exports = Strategy;
