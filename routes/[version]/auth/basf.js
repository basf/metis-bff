
const https = require('https');
const querystring = require('querystring');
const util = require('util');
const OAuth2Strategy = require('passport-oauth2').Strategy;

function Strategy(options = {}, verify) {
    OAuth2Strategy.call(this, options, verify);
    this.name = 'basf';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = async function (accessToken, done) {
	const post_data = querystring.stringify({}); // FIXME post data are void
	const req = https.request({
		host: 'graph.microsoft.com', // FIXME move to settings
		port: 443,
		path: '/oidc/userinfo',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data),
			'Authorization': 'Bearer ' + accessToken
		}
	}, function(resp){
		let result = '';
		resp.on('data', function(chunk){
			result += chunk;
		});
		resp.on('end', function(){
			try {
				return done(null, JSON.parse(result));
			} catch (err){
				return done(new OAuth2Strategy.InternalOAuthError('Failed to parse user profile', err));
			}
		});
	}).on('error', function(err){
		return done(new OAuth2Strategy.InternalOAuthError('Failed to fetch user profile', err));
	});
	req.write(post_data);
	req.end();
};

module.exports = Strategy;

