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
const { serializer, stringify } = require('./utils');

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

// apiTokenMiddleware must be registered before bff.sse
// see https://github.com/PaulMaly/express-bff/blob/d217d0ad1e11d977fe87db28fe59511b3ef26611/index.js#L15-L16
app.use(apiTokenMiddleware);
app.use(express.json({ limit: '5mb' }));

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
        serializer: serializer(),
    },
    api: {
        dir: path.join(__dirname, 'routes'),
    },
    proxy: {
        target: backend.baseURL,
    },
    static: false,
    ssr: false,
    middlewares: [passport.initialize(), passport.session(), sseMiddleware],
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
        res.status(status).set('Content-Type', 'application/json').send(stringify(error));
    }
});

console.log(`***Running ${process.execPath} as of ${process.version}`);

app.listen(PORT, () => {
    // NB app.listen(PORT, "0.0.0.0") to exhibit to the outside
    console.log(`***BFF in ${dev ? 'development' : 'production'} mode listens to port ${PORT}`);
    console.log(`***Backend is expected to run at ${backend.baseURL}`);
});
