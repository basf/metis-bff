const fs = require('fs');
const ini = require('ini');

const { oauth, db, api, webhooks } = ini.parse(fs.readFileSync('./env.ini', 'utf-8'))

const dev = process.env.NODE_ENV === 'development';

const backend = dev ? api.dev : api.prod;

module.exports = {
    oauth: {
        github: {
            clientID: oauth.github.client,
            clientSecret: oauth.github.secret,
            callbackURL: oauth.github.callback,
            scope: oauth.github.scope,
        },
        linkedin: {
            clientID: oauth.linkedin.client,
            clientSecret: oauth.linkedin.secret,
            callbackURL: oauth.linkedin.callback,
            scope: oauth.linkedin.scope,
        },
        orcid: {
            clientID: oauth.orcid.client,
            clientSecret: oauth.orcid.secret,
            callbackURL: oauth.orcid.callback,
        },
        basf: {
            clientID: oauth.basf.client,
            clientSecret: oauth.basf.secret,
            callbackURL: oauth.basf.callback,
        },
    },
    db: {
        client: 'pg',
        version: '13.3',
        connection: {
            database: db.database,
            host: db.host,
            port: db.port,
            user: db.user,
            password: db.password,
        },
        pool: { min: 0, max: 7 },
    },
    backend: {
        ...backend,
        baseURL: `${backend.schema}://${backend.host}:${backend.port}${backend.path}`,
    },
    webhooks,
    dev,
};