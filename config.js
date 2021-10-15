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
            clientID: '82ee7d73d50de04c6221',
            clientSecret: 'c71b609d6e2b91de850c7cb3b28b8cc26f3b18ee',
            callbackURL: '/auth/github',
            scope: ['user'],
        },
        linkedin: {
            clientID: '78uerzm58wch2x',
            clientSecret: 'q9a3oxhJAJsfeoBF',
            callbackURL: '/auth/linkedin',
            scope: ['r_emailaddress', 'r_liteprofile'],
        },
        orcid: {
            clientID: 'APP-4SXAFAP0H6DI4SXY',
            clientSecret: '37eccfcb-a7b6-4b5f-bb13-10254ec40541',
            callbackURL: '/auth/orcid',
        },
        basf: {
            clientID: '',
            clientSecret: '',
            callbackURL: '/auth/basf',
        },
    },
    db: {
        client: 'pg',
        version: '13.3',
        connection: {
            database: 'xraydb',
            host: '188.34.166.142',
            port: 5432,
            user: 'xray',
            password: 'tilde0xray1xray',
        },
        pool: { min: 0, max: 7 },
    }
};