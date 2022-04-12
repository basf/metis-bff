#!/usr/bin/env node

const axios = require('axios');
const EventSource = require('eventsource');

const { db, USER_CALCULATIONS_TABLE } = require('./../../services/db');
const { PORT } = require('./../../config');

const TIMER = '\n🏁 Сalculation completed in';
const HOST = `http://localhost:${PORT}`;
const PROVIDER = 'https://aiida.materialscloud.org/3dd/optimade/v1/structures?filter=nelements=2';
const USER = {
    email: 'member@test.com',
    password: '123123'
};


async function calcUP() {
    try {
        const auth = await axios.post(`${HOST}/v0/auth`, USER);
        const Cookie = auth.headers['set-cookie'][0].match(/^(.*?);/)[1];
        const headers = { Cookie };
        // console.log('auth', Cookie);

        const es = new EventSource(`${HOST}/stream`, {
            withCredentials: true,
            https: false,
            headers
        });

        es.addEventListener('datasources', async (e) => {
            // console.log(e.data);
            if (e.data.length > 2) {
                const dataId = JSON.parse(e.data)[0].id;

                axios.post(`${HOST}/v0/calculations`, { dataId }, { headers });

                console.log('🚀 Calculation start');
                console.time(TIMER);
            } else {
                const optimade = await axios.get(PROVIDER);
                const content = JSON.stringify(optimade.data.data[0]);

                axios.post(`${HOST}/v0/data`, { content }, { headers });
            }
        });

        let count = 0;
        es.addEventListener('calculations', async (e) => {
            if (e.data.length > 2) {
                const { id, progress } = JSON.parse(e.data)[0];

                //TODO - Make progress clear points by 50 || 100
                console.log('CalcID:', id, 'progress:', progress + count);
                count += 1;

                const { uuid } = await db(USER_CALCULATIONS_TABLE).where({ id }).first();

                if (uuid) {
                    axios.post(`${HOST}/v0/webhooks/calc_update`, { uuid, status: 100 });
                } else {
                    cleanUP(es);
                    process.exit(1);
                }
            } else {
                console.timeEnd(TIMER);
                cleanUP(es);
                process.exit(1);
            }
        });

        es.addEventListener('errors', async (e) => {
            if (e.data.length > 2) {
                console.error(JSON.parse(e.data));
                cleanUP(es);
                process.exit(1);
            }
        });

        axios.get(`${HOST}/v0/data`, { headers });
    } catch (e) {
        console.error(e);
    }
}

calcUP();

function cleanUP(es) {
    es.removeEventListener('calculations');
    es.removeEventListener('datasources');
    es.removeEventListener('errors');
    es.close();
}
