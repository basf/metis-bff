const fs = require('fs');
const ini = require('ini');

const { oauth, db, api, webhooks } = ini.parse(fs.readFileSync('./env.ini', 'utf-8'))

const dev = process.env.NODE_ENV === 'development';

const backend = dev ? api.dev : api.prod;

module.exports = {
    oauth: {
        github: {
            clientID: oauth.github.client || 'unset',
            clientSecret: oauth.github.secret || 'unset',
            callbackURL: oauth.github.callback  || 'unset',
            scope: oauth.github.scope,
        },
        linkedin: {
            clientID: oauth.linkedin.client || 'unset',
            clientSecret: oauth.linkedin.secret || 'unset',
            callbackURL: oauth.linkedin.callback || 'unset',
            scope: oauth.linkedin.scope,
        },
        orcid: {
            clientID: oauth.orcid.client || 'unset',
            clientSecret: oauth.orcid.secret || 'unset',
            callbackURL: oauth.orcid.callback || 'unset',
        },
        basf: {
            clientID: oauth.basf.client || 'unset',
            clientSecret: oauth.basf.secret || 'unset',
            callbackURL: oauth.basf.callback || 'unset',
        },
    },
    db: {
        client: 'pg',
        connection: {
            database: db.database,
            host: db.host,
            port: db.port,
            user: db.user,
            password: db.password,
        },
        tprefix: db.tprefix,
        pool: { min: 0, max: 7 },
    },
    backend: {
        ...backend,
        baseURL: `${backend.schema}://${backend.host}:${backend.port}${backend.path}`,
    },
    webhooks,
    dev,
};
