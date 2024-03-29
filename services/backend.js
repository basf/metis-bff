const axios = require('axios');
const querystring = require('querystring');

const { backend: config } = require('../config');

const api = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Key: config.key,
    },
    transformRequest: [
        (data, headers) => {
            const body = querystring.stringify(data);
            headers['Content-Length'] = Buffer.byteLength(body);
            return body;
        },
    ],
    responseType: 'json',
    httpAgent: new require('http').Agent({ family: 4 }), // refuse of ipv6 with backend
});

module.exports = {
    api,
    createDataSource,
    deleteDataSource,
    importDataSource,
    getDataSources,
    runCalculation,
    cancelCalculation,
    getCalculations,
    runPI,
    getDataSourceResult,
    getTemplate,
};

async function createDataSource(content, fmt, name) {
    return api.post('/data/create', { content, fmt, name });
}

async function deleteDataSource(uuid) {
    return api.post('/data/delete', { uuid });
}

async function importDataSource(ext_id) {
    return api.post('/data/import', { ext_id });
}

async function getDataSources(uuids) {
    return api.post('/data/listing', { uuid: uuids.join(':') });
}

async function runCalculation(uuid, engine, input, workflow, webhook_url) {
    return api.post('/calculations/create', { uuid, engine, input, workflow, webhook_url });
}

async function cancelCalculation(uuid) {
    return api.post('/calculations/delete', { uuid });
}

async function getCalculations(uuids) {
    return api.post('/calculations/status', { uuid: uuids.join(':') });
}

async function runPI(uuid, els, strict) {
    return api.post('/calculations/phaseid', { uuid, els, strict });
}

async function getDataSourceResult(uuid) {
    return api.post('/data/examine', { uuid });
}

async function getTemplate(uuid, engine) {
    return api.post('/calculations/template', { uuid, engine });
}
