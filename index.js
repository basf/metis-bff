const path = require('path');
const express = require('express');
const bff = require('express-bff');

const { PORT = 5000, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const secure = !dev;

const app = express();

! dev && app.set('trust proxy', 1); // if nginx used

bff(app, {
    security: {
        cors: false,
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
        path: '/data',
    },
    api: {
        dir: path.join(__dirname, 'routes'),
    },
    proxy: {
        target: 'https://peer.basf.science',
        secure,
    },
    static: {
        dir: path.join(__dirname, 'static'),
        single: true,
        dev,
    },
    ssr: false,
});

app.listen(PORT, () => {
    console.log(`Example app listening at port http://localhost:${PORT}`)
});