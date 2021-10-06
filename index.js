#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bff = require('express-bff');
const passport = require('passport');

const { PORT = 3000, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const secure = !dev;

const app = express();

! dev && app.set('trust proxy', 1); // if nginx used

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
        persist: true,
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
        target: 'https://peer.basf.science',
        secure,
    },
    static: false,
    ssr: {
        handler(req) {
            return { html: '<h1>Hello world</h1>', css: '', head: '' };
        },
    },
    middlewares: [
        passport.initialize(),
        passport.session(),
    ]
});

app.listen(PORT, () => {
    console.log(`Example app listening at port http://localhost:${PORT}`)
});