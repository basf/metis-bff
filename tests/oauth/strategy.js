const axios = require('axios');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const basf = (cb) => {

    const oauth2 = new OAuth2Strategy({
        authorizationURL: 'http://localhost:3001/',
        tokenURL: 'http://localhost:3001/token?code=code',
        clientID: 'basf',
        clientSecret: 'basf',
        callbackURL: 'http://localhost:3000/v0/auth/basf',
    }, cb('basf'));

    // oauth2.getOAuthAccessToken = (code, params, callback) => {
    //     console.log(code, params, callback);
    // };

    oauth2.userProfile = async (accessToken, done) => {
        const { data } = await axios.get('http://localhost:3001/userinfo', {
            headers: { authorization: accessToken }
        });
        return done(null, data);
    };

    return oauth2;
};

module.exports = basf;
