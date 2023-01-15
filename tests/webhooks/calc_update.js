#!/usr/bin/env node

const axios = require('axios');
const EventSource = require('eventsource');

const { db, USER_CALCULATIONS_TABLE } = require('./../../services/db');
const { PORT } = require('./../../config');

const TIMER = '\n🏁 Сalculation completed in';
const BFF_HOST = `http://localhost:${PORT}`;
const PROVIDER = 'https://nomad-lab.eu/prod/rae/optimade/v1/structures?filter=nelements=1';
const USER = {
    email: 'member@test.com',
    password: '123123',
};

async function calc() {
    try {
        const auth = await axios.post(`${BFF_HOST}/v0/auth`, USER);
        const Cookie = auth.headers['set-cookie'][0].match(/^(.*?);/)[1];
        const headers = { Cookie };
        // console.log('auth', Cookie);

        const es = new EventSource(`${BFF_HOST}/stream`, {
            withCredentials: true,
            https: false,
            headers,
        });

        es.addEventListener('datasources', async (e) => {
            const answer = JSON.parse(e.data);

            if (answer.data.length) {
                const dataId = answer.data[0].id;

                axios.post(`${BFF_HOST}/v0/calculations`, { dataId }, { headers });

                console.log('🚀 Calculation start');
                console.time(TIMER);
            } else {
                const optimade = await axios.get(PROVIDER);
                const content = JSON.stringify(optimade.data.data[0]);

                axios.post(`${BFF_HOST}/v0/datasources`, { content }, { headers });
            }
        });

        es.addEventListener('calculations', async (e) => {
            const answer = JSON.parse(e.data);

            if (answer.data.length) {
                const { id, progress } = answer.data[0];

                console.log('CalcID:', id, 'progress:', progress);
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const { uuid } = await db(USER_CALCULATIONS_TABLE).where({ id }).first();
                if (uuid) {
                    console.log('Awaiting for an incoming webhook to BFF...');

                    if (progress == 100) {
                        // NB issue an artificial hook to receive update with no calculation
                        axios.post(`${BFF_HOST}/v0/webhooks/calc_update`, { uuid, progress: 110 });
                    }
                } else {
                    cleanup(es);
                    process.exit(1);
                }
            } else {
                console.timeEnd(TIMER);
                cleanup(es);
                process.exit(1);
            }
        });

        es.addEventListener('errors', async (e) => {
            if (e.data.length > 2) {
                console.error(e.data);
                cleanup(es);
                process.exit(1);
            }
        });

        axios.get(`${BFF_HOST}/v0/datasources`, { headers });
    } catch (e) {
        console.error(e);
    }
}

calc();

function cleanup(es) {
    es.removeEventListener('calculations');
    es.removeEventListener('datasources');
    es.removeEventListener('errors');
    es.close();
}
