const fs = require('fs');
const ini = require('ini');

const { oauth, db, api, webhooks, mail } = ini.parse(fs.readFileSync('./env.ini', 'utf-8'));

const dev = process.env.NODE_ENV === 'development';
const _api = dev ? api.dev : api.prod;

const oauthTest = process.env.OAUTH_TEST === true;

const backend = {
    key: process.env.API_KEY || _api.key,
    schema: process.env.API_SCHEMA || _api.schema,
    host: process.env.API_HOST || _api.host,
    port: process.env.API_PORT || _api.port,
    path: process.env.API_PATH || _api.path,
};

module.exports = {
    PORT: process.env.PORT || 3000,
    oauth: {
        github: {
            clientID: process.env.GITHUB_CLIENT_ID || oauth.github.client || 'unset',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || oauth.github.secret || 'unset',
            callbackURL: process.env.GITHUB_CALLBACK_URL || oauth.github.callback || 'unset',
            scope: process.env.GITHUB_SCOPE || oauth.github.scope,
        },
        linkedin: {
            clientID: process.env.LINKEDIN_CLIENT_ID || oauth.linkedin.client || 'unset',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || oauth.linkedin.secret || 'unset',
            callbackURL: process.env.LINKEDIN_CALLBACK_URL || oauth.linkedin.callback || 'unset',
            scope: process.env.LINKEDIN_SCOPE || oauth.linkedin.scope,
        },
        orcid: {
            clientID: process.env.ORCID_CLIENT_ID || oauth.orcid.client || 'unset',
            clientSecret: process.env.ORCID_CLIENT_SECRET || oauth.orcid.secret || 'unset',
            callbackURL: process.env.ORCID_CALLBACK_URL || oauth.orcid.callback || 'unset',
        },
        basf: (oauthTest ? {
            authorizationURL: 'http://localhost:3001/',
            tokenURL: 'http://localhost:3001/token',
            clientID: 'basf',
            clientSecret: 'basf',
            callbackURL: 'http://localhost:3000/v0/auth/basf',
        } : {
            authorizationURL: process.env.BASF_AUTH_URL || oauth.basf.auth_url || 'unset', // ???
            tokenURL: process.env.BASF_TOKEN_URL || oauth.basf.token_url || 'unset', // ???
            clientID: process.env.BASF_CLIENT_ID || oauth.basf.client || 'unset',
            clientSecret: process.env.BASF_CLIENT_SECRET || oauth.basf.secret || 'unset',
            callbackURL: process.env.BASF_CALLBACK_URL || oauth.basf.callback || 'unset',
        }),
        mpds: {
            authorizationURL: process.env.MPDS_AUTH_URL || oauth.mpds.authorize_url || 'unset',
            tokenURL: process.env.MPDS_ACCESS_TOKEN_URL || oauth.mpds.access_token_url || 'unset',
            clientID: process.env.MPDS_CLIENT_ID || oauth.mpds.client || 'unset',
            clientSecret: process.env.MPDS_CLIENT_SECRET || oauth.mpds.secret || 'unset',
            callbackURL: process.env.MPDS_CALLBACK_URL || oauth.mpds.callback || 'unset',
            userProfileURL: process.env.MPDS_USER_PROFILE_URL || oauth.mpds.user_profile_url || 'unset',
        },
        dummy: {
            authorizationURL: process.env.DUMMY_AUTH_URL || oauth.dummy.authorize_url || 'unset',
            tokenURL: process.env.DUMMY_ACCESS_TOKEN_URL || oauth.dummy.access_token_url || 'unset',
            clientID: process.env.DUMMY_CLIENT_ID || oauth.dummy.client || 'unset',
            clientSecret: process.env.DUMMY_CLIENT_SECRET || oauth.dummy.secret || 'unset',
            callbackURL: process.env.DUMMY_CALLBACK_URL || oauth.dummy.callback || 'unset',
        },
    },
    db: {
        client: 'pg',
        connection: {
            database: process.env.PG_NAME || db.database,
            host: process.env.PG_HOST || db.host,
            port: process.env.PG_PORT || db.port,
            user: process.env.PG_USER || db.user,
            password: process.env.PG_PASSWORD || db.password,
        },
        tprefix: process.env.PG_TABLE_PREFIX || db.tprefix,
        pool: { min: 0, max: 7 },
    },
    backend: {
        ...backend,
        baseURL: `${backend.schema}://${backend.host}:${backend.port}${backend.path}`,
    },
    webhooks: {
        calc_update: process.env.WEBHOOK_CALCULATON_UPDATE || webhooks.calc_update,
    },
    mail: {
        host: process.env.MAIL_HOST || mail.host,
        port: process.env.MAIL_PORT || mail.port,
        user: process.env.MAIL_USER || mail.user,
        pass: process.env.MAIL_PASSWORD || mail.pass,
        from: process.env.MAIL_FROM || mail.from,
    },
    dev,
};
