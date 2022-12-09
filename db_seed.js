#!/usr/bin/env node

const {
    db,
    hashString,

    USER_COLLECTIONS_DATASOURCES_TABLE,
    USER_SHARED_COLLECTIONS_TABLE,
    USER_CALCULATIONS_TABLE,
    USER_DATASOURCES_TABLE,
    COLLECTIONS_TYPES_TABLE,
    USER_COLLECTIONS_TABLE,
    USERS_EMAILS_TABLE,
    USERS_OAUTHS_TABLE,
    USER_ROLES_TABLE,
    USERS_TABLE,

    DEFAULT_USER_ROLE,
    ADMIN_USER_ROLE,

    OAUTH_PROVIDERS_ENUM,
    VISIBILITY_ENUM,
    FLAVORS_ENUM,
} = require('./services/db');

const FOREIGN_KEY_LENGTH = 11;
const NAME_LENGTH = 20;
const EMAIL_LENGTH = 320;
const PASSWORD_LENGTH = 60;

const initDb = () => Promise.all([
    db.schema.dropTableIfExists(USER_COLLECTIONS_DATASOURCES_TABLE),
    db.schema.dropTableIfExists(USER_SHARED_COLLECTIONS_TABLE),
])
    .then(() =>
        Promise.all([
            db.schema.dropTableIfExists(USER_DATASOURCES_TABLE),
            db.schema.dropTableIfExists(USER_COLLECTIONS_TABLE),
            db.schema.dropTableIfExists(USER_CALCULATIONS_TABLE),
            db.schema.dropTableIfExists(USERS_EMAILS_TABLE),
            db.schema.dropTableIfExists(USERS_OAUTHS_TABLE),
        ])
    )

    .then(() =>
        Promise.all([
            db.schema.dropTableIfExists(USERS_TABLE),
            db.schema.dropTableIfExists(COLLECTIONS_TYPES_TABLE),
        ])
    )
    .then(() =>
        Promise.all([
            db.schema.dropTableIfExists(USER_ROLES_TABLE),
            db.schema.raw('DROP TYPE IF EXISTS collection_flavors'),
            db.schema.raw('DROP TYPE IF EXISTS oauth_providers'),
            db.schema.raw('DROP TYPE IF EXISTS collection_visibility'),
        ])
    )
    .then(() =>
        Promise.all([
            db.schema.hasTable(COLLECTIONS_TYPES_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(COLLECTIONS_TYPES_TABLE, (table) => {
                        table.increments('id');
                        table.string('slug', NAME_LENGTH).unique();
                        table.string('label', NAME_LENGTH);
                        table.enu('flavor', FLAVORS_ENUM, {
                            useNative: true,
                            enumName: 'collection_flavors',
                        });
                        table.timestamps(false, true, true);
                    });
                } else {
                    console.log('COLLECTIONS_TYPES_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USER_ROLES_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_ROLES_TABLE, (table) => {
                        table.increments('id');
                        table.string('slug', NAME_LENGTH).unique();
                        table.string('label', NAME_LENGTH);
                        table.jsonb('permissions').nullable();
                        table.timestamps(false, true, true);
                    });
                } else {
                    console.log('USER_ROLES_TABLE AFTER TABLE');
                }
            }),
        ])
    )
    .then(() =>
        Promise.all([
            db.schema.hasTable(USERS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USERS_TABLE, (table) => {
                        table.increments('id');
                        table.string('password', PASSWORD_LENGTH).nullable();
                        table.string('firstName', NAME_LENGTH);
                        table.string('lastName', NAME_LENGTH);
                        table.integer('roleId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.timestamps(false, true, true);

                        table
                            .foreign('roleId', 'fk_roleId')
                            .references('id')
                            .inTable(USER_ROLES_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USERS_TABLE AFTER TABLE');
                }
            }),
        ])
    )

    .then(() =>
        Promise.all([
            db.schema.hasTable(USERS_EMAILS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USERS_EMAILS_TABLE, (table) => {
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.string('email', EMAIL_LENGTH).unique().index();
                        table.string('code', PASSWORD_LENGTH).unique().index();
                        table.boolean('verified').defaultTo(false);
                        table.timestamps(false, true, true);

                        table.primary(['userId', 'email'], { constraintName: 'pk_user_email' });
                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USERS_EMAILS_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USERS_OAUTHS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USERS_OAUTHS_TABLE, (table) => {
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.enu('provider', OAUTH_PROVIDERS_ENUM, {
                            useNative: true,
                            enumName: 'oauth_providers',
                        });
                        table.string('providerId').unique();
                        table.jsonb('profile').nullable();
                        table.timestamps(false, true, true);

                        table.primary(['userId', 'provider'], {
                            constraintName: 'pk_user_provider',
                        });
                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USERS_OAUTHS_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USER_CALCULATIONS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_CALCULATIONS_TABLE, (table) => {
                        table.increments('id');
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.uuid('uuid').unique();
                        table.timestamps(false, true, true);

                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USER_CALCULATIONS_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USER_DATASOURCES_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_DATASOURCES_TABLE, (table) => {
                        table.increments('id');
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.uuid('uuid').unique();
                        table.timestamps(false, true, true);

                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USER_DATASOURCES_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USER_COLLECTIONS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_COLLECTIONS_TABLE, (table) => {
                        table.increments('id');
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.integer('typeId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.string('title', 32);
                        table.string('description', 64);
                        table
                            .enu('visibility', VISIBILITY_ENUM, {
                                useNative: true,
                                enumName: 'collection_visibility',
                            })
                            .defaultTo(VISIBILITY_ENUM[0]);
                        table.timestamps(false, true, true);

                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                        table
                            .foreign('typeId', 'fk_typeId')
                            .references('id')
                            .inTable(COLLECTIONS_TYPES_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USER_COLLECTIONS_TABLE AFTER TABLE');
                }
            }),
        ])
    )
    .then(() =>
        Promise.all([
            db.schema.hasTable(USER_SHARED_COLLECTIONS_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_SHARED_COLLECTIONS_TABLE, (table) => {
                        table.integer('collectionId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.integer('userId', FOREIGN_KEY_LENGTH).unsigned().index();
                        table.jsonb('permissions').nullable();
                        table.timestamps(false, true, true);

                        table.primary(['userId', 'collectionId'], {
                            constraintName: 'pk_user_collection',
                        });
                        table
                            .foreign('userId', 'fk_userId')
                            .references('id')
                            .inTable(USERS_TABLE)
                            .onDelete('CASCADE');
                        table
                            .foreign('collectionId', 'fk_collectionId')
                            .references('id')
                            .inTable(USER_COLLECTIONS_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USER_SHARED_COLLECTIONS_TABLE AFTER TABLE');
                }
            }),
            db.schema.hasTable(USER_COLLECTIONS_DATASOURCES_TABLE).then((exists) => {
                if (!exists) {
                    return db.schema.createTable(USER_COLLECTIONS_DATASOURCES_TABLE, (table) => {
                        table.integer('collectionId').unsigned().index();
                        table.integer('dataSourceId').unsigned().index();
                        table.timestamps(false, true, true);

                        table.primary(['collectionId', 'dataSourceId'], {
                            constraintName: 'pk_collection_dataSource',
                        });
                        table
                            .foreign('collectionId', 'fk_collectionId')
                            .references('id')
                            .inTable(USER_COLLECTIONS_TABLE)
                            .onDelete('CASCADE');
                        table
                            .foreign('dataSourceId', 'fk_dataSourceId')
                            .references('id')
                            .inTable(USER_DATASOURCES_TABLE)
                            .onDelete('CASCADE');
                    });
                } else {
                    console.log('USER_COLLECTIONS_DATASOURCES_TABLE AFTER TABLE');
                }
            }),
        ])
    )
    .then(() => {
        return db(COLLECTIONS_TYPES_TABLE).insert(
            [
                {
                    slug: 'red',
                    label: 'Red',
                    flavor: 'red',
                },
                {
                    slug: 'blue',
                    label: 'Blue',
                    flavor: 'blue',
                },
                {
                    slug: 'green',
                    label: 'Green',
                    flavor: 'green',
                },
                {
                    slug: 'orange',
                    label: 'Orange',
                    flavor: 'orange',
                },
            ],
            ['id', 'slug']
        );
    })
    .then(() => {
        return Promise.all([
            hashString('123123'),
            db(USER_ROLES_TABLE).insert(
                [
                    {
                        slug: DEFAULT_USER_ROLE,
                        label: 'Member',
                        permissions: {},
                    },
                    {
                        slug: ADMIN_USER_ROLE,
                        label: 'Admin',
                        permissions: {},
                    },
                ],
                ['id', 'slug']
            ),
        ]);
    })
    .then(([password, roles]) => {
        const memberRole = roles.find((role) => role.slug === DEFAULT_USER_ROLE);
        const adminRole = roles.find((role) => role.slug === ADMIN_USER_ROLE);

        return db(USERS_TABLE).insert(
            [
                {
                    firstName: 'Test',
                    lastName: 'Member',
                    roleId: memberRole.id,
                    password,
                },
                {
                    firstName: 'Test',
                    lastName: 'Admin',
                    roleId: adminRole.id,
                    password,
                },
                {
                    firstName: 'Test',
                    lastName: 'Test',
                    roleId: memberRole.id,
                    password,
                },
            ],
            ['id']
        );
    })
    .then(async ([member, admin, test]) => {
        const memberEmail = 'member@test.com';
        const adminEmail = 'admin@test.com';
        const testEmail = 'test@test.com';

        const code1 = await hashString(memberEmail);
        const code2 = await hashString(adminEmail);
        const code3 = await hashString(testEmail);

        return db(USERS_EMAILS_TABLE).insert([
            {
                userId: member.id,
                email: memberEmail,
                code: code1,
            },
            {
                userId: admin.id,
                email: adminEmail,
                code: code2,
            },
            {
                userId: test.id,
                email: testEmail,
                code: code3,
            },
        ]);
    });


const isExists = () => Promise.all([
    COLLECTIONS_TYPES_TABLE,
    USERS_EMAILS_TABLE,
    USERS_OAUTHS_TABLE,
    USERS_TABLE,
    USER_CALCULATIONS_TABLE,
    USER_COLLECTIONS_DATASOURCES_TABLE,
    USER_COLLECTIONS_TABLE,
    USER_DATASOURCES_TABLE,
    USER_ROLES_TABLE,
    USER_SHARED_COLLECTIONS_TABLE,
].map((name) => db.schema.hasTable(name))).then((res) => res.some(Boolean));


isExists().then((exists) => {
    if (exists) {
        console.error("Database is not empty!");
        forced = Boolean(process.env.FORCE_DB_INIT);
        if (!forced) {
            console.error(
                "Aborting. Set FORCE_DB_INIT if you really want to destroy data!"
            );
            return process.exit(2);
        };
    }
    console.error("Populating database...");
    return initDb();
}).catch((err) => {
    console.error(err.message);
    process.exit(1);
}).then(() => process.exit(0));
