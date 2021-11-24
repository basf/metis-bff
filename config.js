const fs = require('fs');
const ini = require('ini');

const config = ini.parse(fs.readFileSync('./env.ini', 'utf-8'))

const sandbox = process.env.NODE_ENV !== 'production';

module.exports = {
    target: {
        'dev': {
            'schema': 'http',
            'host': 'localhost',
            'port': 7070,
            'path': ''
        },
        'prod': {
            'schema': 'https',
            'host': 'peer.basf.science',
            'port': 443,
            'path': '/v0'
        },
        'get_url': function(which){
            return this[which].schema + '://' + this[which].host + ':' + this[which].port + this[which].path;
        }
    },
    oauth: {
        github: {
            clientID: config.oauth.github.client || 'unset',
            clientSecret: config.oauth.github.secret || 'unset',
            callbackURL: config.oauth.github.callback || 'unset',
            scope: config.oauth.github.scope,
        },
        linkedin: {
            clientID: config.oauth.linkedin.client || 'unset',
            clientSecret: config.oauth.linkedin.secret || 'unset',
            callbackURL: config.oauth.linkedin.callback || 'unset',
            scope: config.oauth.linkedin.scope,
        },
        orcid: {
            clientID: config.oauth.orcid.client || 'unset',
            clientSecret: config.oauth.orcid.secret || 'unset',
            callbackURL: config.oauth.orcid.callback || 'unset',
        },
        basf: {
            clientID: config.oauth.basf.client || 'unset',
            clientSecret: config.oauth.basf.secret || 'unset',
            callbackURL: config.oauth.basf.callback || 'unset',
        },
    },
    db: {
        client: 'pg',
        version: '13.3',
        connection: {
            database: config.db.database,
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
        },
        pool: { min: 0, max: 7 },
    }
};