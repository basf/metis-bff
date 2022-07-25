'use strict';

const cors = require('cors');
const express = require('express');

run().catch(err => console.log(err));

async function run() {
    const app = express();

    const authCodes = new Set();
    const accessTokens = new Set();

    app.use(express.urlencoded({ extended: true }));

    app.post('/code', (req, res) => {
        const referer = new URL(req.headers.referer);
        const redirectUri = referer.searchParams.get('redirect_uri');
        const authCode = new Array(10).fill(null).map(() => Math.floor(Math.random() * 10)).join('');

        authCodes.add(authCode);

        res.cookie('code', authCode, { httpOnly: true });
        res.redirect(`${redirectUri}?code=${authCode}&state=state`);
    });

    app.options('/token', cors(), (req, res) => res.end());
    app.options('/userinfo', cors(), (req, res) => res.end());

    app.post('/token', cors(), (req, res) => {
        if (authCodes.has(req.body.code)) {
            const token = new Array(50).fill(null).map(() => Math.floor(Math.random() * 10)).join('');

            authCodes.delete(req.body.code);
            accessTokens.add(`Bearer ${token}`);

            res.json({ 'access_token': token, 'expires_in': 60 * 60 * 24 });
        } else {
            res.status(400).json({ message: 'Invalid auth token' });
        }
    });

    app.get('/userinfo', cors(), (req, res) => {
        const authorization = req.get('authorization');
        if (!accessTokens.has(authorization)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        return res.json({ id: 1, login: 'basf', email: 'basf@basf.basf', provider: 'basf' });
    });

    app.use(express.static('./'));
    app.listen(3001);

    console.log('OAuth2 test server on port 3001');
}
