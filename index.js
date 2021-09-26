#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bff = require('express-bff');

const { PORT = 3000, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const secure = !dev;

const config = require('./config');

const app = express();

!dev && app.set('trust proxy', 1); // if nginx used
app.set('development mode', !!dev);

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
            secure: false, // TODO FIXME?
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
        target: config.target.get_url( dev ? 'dev': 'prod' ),
        secure: false, // TODO FIXME?
    },
    static: false,
    ssr: false,
});

app.listen(PORT, () => {
    console.log(`App in dev-mode=${dev} listens to http://localhost:${PORT}`);
});