const { db: dbConfig } = require('../config');

const bcrypt = require('bcrypt');

const db = require('knex')(dbConfig);

const USERS_TABLE = dbConfig.tprefix + 'users';
const USER_CALCULATIONS_TABLE = dbConfig.tprefix + 'user_calculations';
const USER_DATASOURCES_TABLE = dbConfig.tprefix + 'user_datasources';
const USERS_EMAILS_TABLE = dbConfig.tprefix + 'users_emails';
const USER_OAUTHS_TABLE = dbConfig.tprefix + 'users_oauths';
const USER_ROLES_TABLE = dbConfig.tprefix + 'user_roles';
const USER_COLLECTONS_TABLE = dbConfig.tprefix + 'user_collections';
const USER_SHARED_COLLECTONS_TABLE = dbConfig.tprefix + 'user_collections_shared';
const USER_COLLECTONS_DATASOURCES_TABLE = dbConfig.tprefix + 'user_collections_datasources';
const COLLECTONS_TYPES_TABLE = dbConfig.tprefix + 'collection_types';

const DEFAULT_FIELDS = ['id', 'userId', 'uuid', 'createdAt', 'updatedAt'];

const DATASOURCE_FIELDS = [
    `${USER_DATASOURCES_TABLE}.id`,
    `${USER_DATASOURCES_TABLE}.userId`,
    `${USER_DATASOURCES_TABLE}.uuid`,
    `${USER_DATASOURCES_TABLE}.createdAt`,
    `${USER_DATASOURCES_TABLE}.updatedAt`,
];

const USER_SHORT_FIELDS = [
    `${USERS_TABLE}.id`,
    `${USERS_TABLE}.firstName`,
    `${USERS_TABLE}.lastName`,
    `${USERS_EMAILS_TABLE}.email`,
];

const USER_JOINED_FIELDS = [
    `${USERS_TABLE}.id`,
    `${USERS_TABLE}.firstName`,
    `${USERS_TABLE}.lastName`,
    `${USERS_TABLE}.password`,
    `${USERS_TABLE}.roleId`,
    `${USERS_TABLE}.createdAt`,
    `${USERS_TABLE}.updatedAt`,
    `${USER_ROLES_TABLE}.label as roleLabel`,
    `${USER_ROLES_TABLE}.slug as roleSlug`,
    `${USER_ROLES_TABLE}.permissions`,
    `${USERS_EMAILS_TABLE}.email`,
    `${USERS_EMAILS_TABLE}.code as emailCode`,
    `${USERS_EMAILS_TABLE}.verified as emailVerified`,
    `${USER_OAUTHS_TABLE}.provider`,
];

const COLLECTION_JOINED_FIELDS = [
    `${USER_COLLECTONS_TABLE}.id`,
    `${USER_COLLECTONS_TABLE}.title`,
    `${USER_COLLECTONS_TABLE}.description`,
    `${USER_COLLECTONS_TABLE}.visibility`,
    `${USER_COLLECTONS_TABLE}.userId`,
    `${USER_COLLECTONS_TABLE}.typeId`,
    `${USER_COLLECTONS_TABLE}.createdAt`,
    `${USER_COLLECTONS_TABLE}.updatedAt`,
    `${USERS_TABLE}.firstName as userFirstName`,
    `${USERS_TABLE}.lastName as userLastName`,
    `${COLLECTONS_TYPES_TABLE}.slug as typeSlug`,
    `${COLLECTONS_TYPES_TABLE}.label as typeLabel`,
    `${COLLECTONS_TYPES_TABLE}.flavor as typeFlavor`,
];

const DEFAULT_USER_ROLE = 'member';
const ADMIN_USER_ROLE = 'admin';

const PUBLIC_COLLECTION_VISIBILITY = 'community';
const SHARED_COLLECTION_VISIBILITY = 'shared';
const PRIVATE_COLLECTION_VISIBILITY = 'private';

const OAUTH_PROVIDERS_ENUM = [
    'basf',
    'github',
    'linkedin',
    'orcid'
];
const FLAVORS_ENUM = [
    'red',
    'pink',
    'purple',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'green',
    'lime',
    'yellow',
    'orange',
    'brown',
    'grey',
];
const VISIBILITY_ENUM = [
    PRIVATE_COLLECTION_VISIBILITY,
    SHARED_COLLECTION_VISIBILITY,
    PUBLIC_COLLECTION_VISIBILITY,
];

const selectDataSourcesByUserId = selectAllByUserId(USER_DATASOURCES_TABLE, DATASOURCE_FIELDS);
const selectCalculationsByUserId = selectAllByUserId(USER_CALCULATIONS_TABLE);
const deleteUserDataSource = deleteFirstByUserId(USER_DATASOURCES_TABLE);
const deleteUserCalculation = deleteFirstByUserId(USER_CALCULATIONS_TABLE);
const deleteUserCollection = deleteFirstByUserId(USER_COLLECTONS_TABLE, ['id']);
const insertUserDataSource = insertByUserId(USER_DATASOURCES_TABLE);
const insertUserCalculation = insertByUserId(USER_CALCULATIONS_TABLE);
const insertUserCollection = insertByUserId(USER_COLLECTONS_TABLE, ['id']);
const upsertUserCollection = upsertByUserId(USER_COLLECTONS_TABLE, ['id']);
const updateUserCollection = updateByUserId(USER_COLLECTONS_TABLE, ['id']);
const selectDataSourceByUserId = selectFirstByUserId(USER_DATASOURCES_TABLE);

module.exports = {
    db,
    hashString,
    selectFirstUser,
    compareStringHash,

    deleteUserCollection,
    deleteUserDataSource,
    upsertUserCollection,
    updateUserCollection,
    insertUserCollection,
    insertUserDataSource,
    insertUserCalculation,
    deleteUserCalculation,
    selectCollectionTypes,
    selectCollections,
    selectDataSources,
    selectDataSourceByUserId,
    selectDataSourcesByUserId,
    selectCalculationsByUserId,
    selectCalculationsByUserIdAndRole,
    // selectUserCollectionsByDataSources,
    delsertSharedCollectionUsers,
    delsertCollectionDataSources,
    delsertDataSourceCollections,
    searchUsers,
    upsertUser,
    selectUsersByIds,

    OAUTH_PROVIDERS_ENUM,
    VISIBILITY_ENUM,
    FLAVORS_ENUM,
    USER_COLLECTONS_DATASOURCES_TABLE,
    USER_SHARED_COLLECTONS_TABLE,
    USER_CALCULATIONS_TABLE,
    USER_DATASOURCES_TABLE,
    COLLECTONS_TYPES_TABLE,
    USER_COLLECTONS_TABLE,
    USERS_EMAILS_TABLE,
    USER_OAUTHS_TABLE,
    USER_ROLES_TABLE,
    USERS_TABLE,
    ADMIN_USER_ROLE,
    DEFAULT_USER_ROLE,
    PUBLIC_COLLECTION_VISIBILITY,
    SHARED_COLLECTION_VISIBILITY,
    PRIVATE_COLLECTION_VISIBILITY,
};

async function hashString(str, salt = 10) {
    return bcrypt.hash(str, salt);
}

async function compareStringHash(str, hash) {
    return bcrypt.compare(str, hash);
}

function insertByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, inserts = {}, fields = defaultFields) => {
        const inserted = await db(table).insert({ ...inserts, userId }, fields);
        return inserted && inserted[0];
    };
}

function upsertByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, upserts = {}, fields = defaultFields) => {
        const upserted = await db(table)
            .insert({ ...upserts, userId }, fields)
            .onConflict('id')
            .merge();
        return upserted && upserted[0];
    };
}

function updateByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, id, updates = {}, fields = defaultFields) => {
        const updated = await db(table).where({ id, userId }).update(updates, fields);
        return updated && updated[0];
    };
}

function deleteFirstByUserId(table, defaultFields = ['uuid']) {
    return async (userId, id, fields = defaultFields) => {
        const deleted = await db(table).where({ id, userId }).del(fields);
        return deleted && deleted[0];
    };
}

function selectAllByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, query = {}, fields = defaultFields) => {
        return db
            .select(...fields)
            .from(table)
            .where({ ...query, userId });
    };
}

function selectFirstByUserId(table, defaultFields = DEFAULT_FIELDS) {
    return async (userId, query = {}, fields = defaultFields) => {
        return db
            .select(...fields)
            .from(table)
            .where({ ...query, userId })
            .first();
    };
}

function selectCalculationsByUserIdAndRole(userId, roleSlug = DEFAULT_USER_ROLE) {
    if (roleSlug === ADMIN_USER_ROLE) {
        return db(USER_CALCULATIONS_TABLE).select(...DEFAULT_FIELDS);
    } else {
        return selectCalculationsByUserId(userId);
    }
}

async function selectDataSources(user, query = {}) {
    const { collectionIds = [], dataSourceIds = [], offset, limit } = query;

    const model = db(USER_DATASOURCES_TABLE)
        .leftJoin(
            USER_COLLECTONS_DATASOURCES_TABLE,
            `${USER_DATASOURCES_TABLE}.id`,
            `${USER_COLLECTONS_DATASOURCES_TABLE}.dataSourceId`
        )
        .leftJoin(
            USER_SHARED_COLLECTONS_TABLE,
            `${USER_SHARED_COLLECTONS_TABLE}.collectionId`,
            `${USER_COLLECTONS_DATASOURCES_TABLE}.collectionId`
        )
        .leftJoin(
            USER_COLLECTONS_TABLE,
            `${USER_COLLECTONS_DATASOURCES_TABLE}.collectionId`,
            `${USER_COLLECTONS_TABLE}.id`
        )
        .where((builder) => {
            if (user.roleSlug !== ADMIN_USER_ROLE)
                builder
                    .where(`${USER_DATASOURCES_TABLE}.userId`, user.id)
                    .orWhere(`${USER_SHARED_COLLECTONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_COLLECTONS_TABLE}.visibility`, PUBLIC_COLLECTION_VISIBILITY);
        })
        .where((builder) => {
            if (collectionIds.length)
                builder.whereIn(`${USER_COLLECTONS_TABLE}.id`, collectionIds);
        });

    const totalCount = await model.clone().count();
    const total = totalCount[0]['count'];

    const data = await model.clone()
        .limit(limit || total, { skipBinding: true })
        .offset(offset || 0, { skipBinding: true })
        .select(...DATASOURCE_FIELDS);

    return { total, data };
}

async function selectCollections(user, query = {}) {
    const { collectionIds = [], dataSourceIds = [], offset, limit, visibility, type } = query;

    const model = db(USER_COLLECTONS_TABLE)
        .join(
            USERS_TABLE,
            `${USERS_TABLE}.id`,
            `${USER_COLLECTONS_TABLE}.userId`
        )
        .leftJoin(
            USER_SHARED_COLLECTONS_TABLE,
            `${USER_COLLECTONS_TABLE}.id`,
            `${USER_SHARED_COLLECTONS_TABLE}.collectionId`
        )
        .leftJoin(
            COLLECTONS_TYPES_TABLE,
            `${COLLECTONS_TYPES_TABLE}.id`,
            `${USER_COLLECTONS_TABLE}.typeId`
        )
        .leftJoin(
            USER_COLLECTONS_DATASOURCES_TABLE,
            `${USER_COLLECTONS_TABLE}.id`,
            `${USER_COLLECTONS_DATASOURCES_TABLE}.collectionId`
        )
        .where((builder) => {
            if (user.roleSlug !== ADMIN_USER_ROLE)
                builder
                    .where(`${USER_COLLECTONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_SHARED_COLLECTONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_COLLECTONS_TABLE}.visibility`, PUBLIC_COLLECTION_VISIBILITY);
        })
        .where((builder) => {
            if (type) builder.where(`${COLLECTONS_TYPES_TABLE}.slug`, type);
            if (visibility) builder.where(`${USER_COLLECTONS_TABLE}.visibility`, visibility);
            if (collectionIds.length)
                builder.whereIn(`${USER_COLLECTONS_TABLE}.id`, collectionIds);
            if (dataSourceIds.length)
                builder.whereIn(`${USER_COLLECTONS_DATASOURCES_TABLE}.dataSourceId`, dataSourceIds);
        })
        .distinct();

    const totalCount = await model.clone().count();
    const total = totalCount[0]['count'];

    const data = await model.clone()
        .limit(limit || total, { skipBinding: true })
        .offset(offset || 0, { skipBinding: true })
        .select(...COLLECTION_JOINED_FIELDS);

    return { total, data };
}

// function selectUserCollectionsByDataSources(userId, dataSourceIds = [], query = {}) {
//     return db(USER_COLLECTONS_TABLE)
//         .join(
//             USER_COLLECTONS_DATASOURCES_TABLE,
//             `${USER_COLLECTONS_TABLE}.id`,
//             `${USER_COLLECTONS_DATASOURCES_TABLE}.collectionId`
//         )
//         .leftJoin(USERS_TABLE, `${USERS_TABLE}.id`, `${USER_COLLECTONS_TABLE}.userId`)
//         .leftJoin(
//             COLLECTONS_TYPES_TABLE,
//             `${COLLECTONS_TYPES_TABLE}.id`,
//             `${USER_COLLECTONS_TABLE}.typeId`
//         )
//         .select(`${USER_COLLECTONS_DATASOURCES_TABLE}.dataSourceId`, ...COLLECTION_JOINED_FIELDS)
//         .where(addTablePrefix(USER_COLLECTONS_TABLE, query))
//         .where((builder) => {
//             builder
//                 .where(`${USER_COLLECTONS_TABLE}.userId`, userId)
//                 .orWhere(`${USER_COLLECTONS_TABLE}.visibility`, SHARED_COLLECTION_VISIBILITY);
//         })
//         .whereIn(`${USER_COLLECTONS_DATASOURCES_TABLE}.dataSourceId`, dataSourceIds);
// }

async function delsertCollectionDataSources(collectionId, dataSourceIds) {
    if (dataSourceIds.length) {
        const deleted = await db(USER_COLLECTONS_DATASOURCES_TABLE)
            .where('collectionId', collectionId)
            .whereNotIn('dataSourceId', dataSourceIds)
            .del();

        const inserts = dataSourceIds.map((dataSourceId) => ({ dataSourceId, collectionId }));

        return db(USER_COLLECTONS_DATASOURCES_TABLE)
            .insert(inserts, ['dataSourceId'])
            .onConflict(['collectionId', 'dataSourceId'])
            .ignore();
    } else {
        const deleted = await db(USER_COLLECTONS_DATASOURCES_TABLE)
            .where('collectionId', collectionId)
            .del();
        return [];
    }
}

async function delsertDataSourceCollections(dataSourceId, collectionIds) {
    if (collectionIds.length) {
        const deleted = await db(USER_COLLECTONS_DATASOURCES_TABLE)
            .where('dataSourceId', dataSourceId)
            .whereNotIn('collectionId', collectionIds)
            .del();

        const inserts = collectionIds.map((collectionId) => ({ dataSourceId, collectionId }));

        return db(USER_COLLECTONS_DATASOURCES_TABLE)
            .insert(inserts, ['collectionId'])
            .onConflict(['collectionId', 'dataSourceId'])
            .ignore();
    } else {
        const deleted = await db(USER_COLLECTONS_DATASOURCES_TABLE)
            .where('dataSourceId', dataSourceId)
            .del();
        return [];
    }
}

async function delsertSharedCollectionUsers(collectionId, userIds) {
    if (userIds.length) {
        const deleted = await db(USER_SHARED_COLLECTONS_TABLE)
            .where('collectionId', collectionId)
            .whereNotIn('userId', userIds)
            .del();

        const inserts = userIds.map((userId) => ({ userId, collectionId }));

        return db(USER_SHARED_COLLECTONS_TABLE)
            .insert(inserts, ['userId'])
            .onConflict(['userId', 'collectionId'])
            .ignore();
    } else {
        const deleted = await db(USER_SHARED_COLLECTONS_TABLE)
            .where('collectionId', collectionId)
            .del();
        return [];
    }
}

function selectFirstUser(query = {}) {
    return db(USERS_TABLE)
        .leftJoin(USER_ROLES_TABLE, `${USERS_TABLE}.roleId`, `${USER_ROLES_TABLE}.id`)
        .leftJoin(USERS_EMAILS_TABLE, `${USERS_TABLE}.id`, `${USERS_EMAILS_TABLE}.userId`)
        .leftJoin(USER_OAUTHS_TABLE, `${USERS_TABLE}.id`, `${USER_OAUTHS_TABLE}.userId`)
        .select(...USER_JOINED_FIELDS)
        .where(query)
        .first();
}

async function upsertUser({ email, provider, providerId, profile, ...user }) {
    if (email) {
        const existingUser = await db(USERS_TABLE)
            .leftJoin(USERS_EMAILS_TABLE, `${USERS_TABLE}.id`, `${USERS_EMAILS_TABLE}.userId`)
            .select(`${USERS_TABLE}.*`)
            .where({ [`${USERS_EMAILS_TABLE}.email`]: email })
            .first();
        existingUser && Object.assign(user, existingUser);
    }

    if (user.roleId) {
        const role = await db(USER_ROLES_TABLE).where({ id: user.roleId }).first();
        !role && (user.roleId = null);
    }

    if (!user.roleId) {
        const role = await db(USER_ROLES_TABLE).where({ slug: DEFAULT_USER_ROLE }).first();
        user.roleId = role.id;
    }

    const upserted = await db(USERS_TABLE).insert(user, ['id']).onConflict('id').merge();

    if (upserted && upserted[0]) {
        const userId = upserted[0].id;

        if (email) {
            const code = await hashString(email);
            await db(USERS_EMAILS_TABLE)
                .insert({ userId, email, code })
                .onConflict('email')
                .merge();
        }

        if (provider && providerId) {
            await db(USER_OAUTHS_TABLE)
                .insert({
                    profile: JSON.stringify(profile),
                    providerId,
                    provider,
                    userId,
                })
                .onConflict('providerId')
                .merge();
        }

        return upserted[0];
    }
}

function selectCollectionTypes() {
    return db.select().from(COLLECTONS_TYPES_TABLE);
}

function searchUsers(str, limit = 10) {
    const like = `%${str}%`;
    return db(USERS_TABLE)
        .leftJoin(USERS_EMAILS_TABLE, `${USERS_TABLE}.id`, `${USERS_EMAILS_TABLE}.userId`)
        .select(...USER_SHORT_FIELDS)
        .whereILike(`${USERS_TABLE}.firstName`, like)
        .orWhereILike(`${USERS_TABLE}.lastName`, like)
        .orWhereILike(`${USERS_EMAILS_TABLE}.email`, like)
        .limit(limit);
}

function selectUsersByIds(ids) {
    return db(USERS_TABLE)
        .leftJoin(USERS_EMAILS_TABLE, `${USERS_TABLE}.id`, `${USERS_EMAILS_TABLE}.userId`)
        .select(...USER_SHORT_FIELDS)
        .whereIn(`${USERS_TABLE}.id`, ids);
}

function addTablePrefix(TABLE, query = {}) {
    return Object.entries(query).reduce((where, [field, value]) => {
        where[`${TABLE}.${field}`] = value;
        return where;
    }, {});
}
