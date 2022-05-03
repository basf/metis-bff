#!/usr/bin/env node

const { db, USERS_TABLE } = require('./../../services/db');

db(USERS_TABLE)
    .insert(
        [
            {
                email: 'eb@tilde.pro',
                firstName: 'Evgeny',
                lastName: 'Blokhin',
            },
            {
                email: 'robot@absolidix.com',
                firstName: 'Robot',
                lastName: 'Account',
            },
            {
                email: 'pm@tilde.pro',
                firstName: 'Pavel',
                lastName: 'Malyshev',
            },
            {
                email: 'av@tilde.pro',
                firstName: 'Alexander',
                lastName: 'Volkov',
            },
            {
                email: 'os@tilde.pro',
                firstName: 'Oleg',
                lastName: 'Sugin',
            },
        ],
        ['*']
    )
    .then(console.log)
    .catch(console.error);
