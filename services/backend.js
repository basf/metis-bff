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
});

module.exports = {
    cancelCalculation,
    deleteDataSource,
    createDataSource,
    getCalculations,
    runCalculation,
    getDataSources,
    getEngines,
    api,
};

async function createDataSource(content) {
    return api.post('/data/create', { content });
}

async function deleteDataSource(uuid) {
    return api.post('/data/delete', { uuid });
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

async function getEngines() {
    return api.get('/calculations/supported');
}
