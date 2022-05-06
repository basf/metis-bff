#!/usr/bin/env node

const { db, hashString, USERS_TABLE, USERS_EMAILS_TABLE } = require('./../../services/db');

const source = [
    {
        id: 3,
        roleId: 1,
        firstName: 'Evgeny',
        lastName: 'Blokhin',
        email: 'eb@tilde.pro',
    },
    {
        id: 4,
        roleId: 1,
        firstName: 'Robot',
        lastName: 'Account',
        email: 'robot@absolidix.com',
    },
    {
        id: 5,
        roleId: 1,
        firstName: 'Pavel',
        lastName: 'Malyshev',
        email: 'pm@tilde.pro',
    },
    {
        id: 6,
        roleId: 1,
        firstName: 'Alexander',
        lastName: 'Volkov',
        email: 'av@tilde.pro',
    },
    {
        id: 7,
        roleId: 1,
        firstName: 'Oleg',
        lastName: 'Sugin',
        email: 'os@tilde.pro',
    },
];

Promise.all(source.map(async (user) => ({
    id: user.id,
    roleId: user.roleId,
    firstName: user.firstName,
    lastName: user.lastName,
    password: await hashString(user.email),
})))
    .then(users => {
        return db(USERS_TABLE)
            .insert(users, ['*'])
            .onConflict('id')
            .merge();
    })
    .then(async ([...users]) => {
        return Promise.all(source.map(async (user, i) => ({
            userId: users[i].id,
            email: user.email,
            code: await hashString(user.email),
        })))
            .then(emails => {
                return db(USERS_EMAILS_TABLE)
                    .insert(emails, ['*'])
                    .onConflict('email')
                    .merge();
            });
    })
    .then(console.log)
    .catch(console.error);
