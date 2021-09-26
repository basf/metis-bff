
const target = {
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
};

module.exports = {
    target
};