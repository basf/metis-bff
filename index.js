#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bff = require('express-bff');
const passport = require('passport');
const { getReasonPhrase } = require('http-status-codes');

const { dev, http: httpConf, backend, PORT } = require('./config');

const sseMiddleware = require('./middlewares/sse');

const { USERS_TABLE, selectFirstUser } = require('./services/db');
const { middleware: apiTokenMiddleware } = require('./middlewares/apiToken');

const app = express();

if (httpConf.trust_proxy) {
    app.set('trust proxy', 1); // if behind proxy
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await selectFirstUser({ [`${USERS_TABLE}.id`]: id });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

bff(app, {
    security: {
        cors: {
            credentials: true,
            origin: true,
        },
        csrf: false,
        secure: httpConf.force_https,
    },
    session: {
        persist: false,
        resave: true,
        cookie: {
            secure: false, // TODO FIXME?
            httpOnly: true,
            sameSite: false,
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
        target: backend.baseURL,
    },
    static: false,
    ssr: false,
    middlewares: [passport.initialize(), passport.session(), apiTokenMiddleware, sseMiddleware],
});

app.use((err, req, res, next) => {
    const DB = err.code !== 'ECONNREFUSED';
    const status = err.status || (!req.user && DB ? 401 : 500);
    const error = err || { status, error: getReasonPhrase(status) };

    console.error(error);

    if (!req.user)
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
        });

    if (res.headersSent) {
        res.sse.sendTo({ reqId: req.id, data: [error] }, 'errors');
    } else {
        res.status(status).json(error);
    }
});

console.log(`***Running ${process.execPath} as of ${process.version}***`);

app.listen(PORT, () => {
    // NB app.listen(PORT, "0.0.0.0"
    console.log(`App in dev-mode=${dev} listens to port ${PORT}`);
});
