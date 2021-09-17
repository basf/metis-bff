#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bff = require('express-bff');

const { PORT = 3000, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const secure = !dev;

const app = express();

!dev && app.set('trust proxy', 1); // if nginx used

bff(app, {
    security: {
        cors: {
            credentials: true,
            origin: true,
        },
        csrf: false,
        secure,
    },
    session: {
        persist: !dev,
        cookie: {
            secure,
            httpOnly: true,
            sameSite: true,
            maxAge: 86400000,
        },
    },
    sse: {
        path: '/stream',
    },
    api: {
        dir: path.join(__dirname, 'routes'),
    },
    proxy: {
        target: 'http://localhost:7070', // https://peer.basf.science
        secure,
    },
    static: false,
    ssr: false,
});

app.listen(PORT, () => {
    console.log(`App in dev-mode=${dev} listens to http://localhost:${PORT}`);
});