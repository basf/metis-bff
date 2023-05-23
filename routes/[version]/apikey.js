const { checkAuth } = require('../../middlewares/auth');
const { selectAPIToken, setAPIToken, removeAPIToken } = require('../../services/db');

module.exports = {
    get: [checkAuth, get],
    put: [checkAuth, put],
    delete: [checkAuth, del],
};

function generateAPIToken() {

    let result = '',
        counter = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    const charlen = chars.length;

    while (counter < 11) {
        result += chars.charAt(Math.floor(Math.random() * charlen));
        counter += 1;
    }
    return 'METIS' + result;
}

/**
 * @api {put} /v0/apikey Create new API key
 * @apiName SetAPIKey
 * @apiGroup Users
 * @apiDescription Create new API key
 * @apiPermission GUI_ONLY
 */
async function put(req, res, next) {
    return res.json({'apikey': await setAPIToken(req.user.id, generateAPIToken())});
}

/**
 * @api {del} /v0/apikey Remove API key
 * @apiName RemoveAPIKey
 * @apiGroup Users
 * @apiDescription Remove all API keys
 * @apiPermission GUI_ONLY
 */
async function del(req, res, next) {
    removeAPIToken(req.user.id);
    return res.json({});
}

/**
 * @api {get} /v0/apikey Check if API key exists
 * @apiName GetAPIKey
 * @apiGroup Users
 * @apiDescription Get API key, if any
 * @apiPermission GUI_ONLY
 */
async function get(req, res, next) {
    return res.json({'apikey': await selectAPIToken(req.user.id)});
}
