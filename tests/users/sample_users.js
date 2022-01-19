#!/usr/bin/env node

const { db, USERS_TABLE } = require('./../../services/db');

db(USERS_TABLE).insert([

    {
        email: 'eb@tilde.pro',
        firstname: 'Evgeny',
        lastname: 'Blokhin',
    },
    {
        email: 'robot@absolidix.com',
        firstname: 'Robot',
        lastname: 'Account',
    },
    {
        email: 'pm@tilde.pro',
        firstname: 'Pavel',
        lastname: 'Malyshev',
    },
    {
        email: 'av@tilde.pro',
        firstname: 'Alexander',
        lastname: 'Volkov',
    },
    {
        email: 'os@tilde.pro',
        firstname: 'Oleg',
        lastname: 'Sugin',
    },

], ['*']).then(console.log).catch(console.error);
