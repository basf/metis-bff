const { db: dbConfig } = require('../config');

const bcrypt = require('bcrypt');

const db = require('knex')(dbConfig);

export const FOREIGN_KEY_LENGTH = 11;
export const NAME_LENGTH = 20;
export const EMAIL_LENGTH = 320;
export const PASSWORD_LENGTH = 60;

const USERS_TABLE = dbConfig.tprefix + 'users';
const USER_CALCULATIONS_TABLE = dbConfig.tprefix + 'user_calculations';
const USER_DATASOURCES_TABLE = dbConfig.tprefix + 'user_datasources';
const USERS_EMAILS_TABLE = dbConfig.tprefix + 'users_emails';
const USERS_OAUTHS_TABLE = dbConfig.tprefix + 'users_oauths';
const USER_ROLES_TABLE = dbConfig.tprefix + 'user_roles';
const USER_COLLECTIONS_TABLE = dbConfig.tprefix + 'user_collections';
const USER_SHARED_COLLECTIONS_TABLE = dbConfig.tprefix + 'user_collections_shared';
const USER_COLLECTIONS_DATASOURCES_TABLE = dbConfig.tprefix + 'user_collections_datasources';
const COLLECTIONS_TYPES_TABLE = dbConfig.tprefix + 'collection_types';
const USER_API_TOKENS_TABLE = dbConfig.tprefix + 'user_api_tokens';
const LOGS_TABLE = dbConfig.tprefix + 'logs';

const DEFAULT_FIELDS = ['id', 'userId', 'uuid', 'createdAt', 'updatedAt'];

const USER_SHORT_FIELDS = [
    `${USERS_TABLE}.id`,
    `${USERS_TABLE}.firstName`,
    `${USERS_TABLE}.lastName`,
    `${USERS_EMAILS_TABLE}.email`,
];

const DATASOURCE_FIELDS = [
    `${USER_DATASOURCES_TABLE}.id`,
    `${USER_DATASOURCES_TABLE}.uuid`,
    `${USER_DATASOURCES_TABLE}.userId`,
    `${USER_DATASOURCES_TABLE}.createdAt`,
    `${USER_DATASOURCES_TABLE}.updatedAt`,
    `${USERS_TABLE}.firstName as userFirstName`,
    `${USERS_TABLE}.lastName as userLastName`,
    `${USERS_EMAILS_TABLE}.email as userEmail`,
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
    `${USERS_OAUTHS_TABLE}.provider`,
];

const COLLECTION_JOINED_FIELDS = [
    `${USER_COLLECTIONS_TABLE}.id`,
    `${USER_COLLECTIONS_TABLE}.title`,
    `${USER_COLLECTIONS_TABLE}.description`,
    `${USER_COLLECTIONS_TABLE}.visibility`,
    `${USER_COLLECTIONS_TABLE}.userId`,
    `${USER_COLLECTIONS_TABLE}.typeId`,
    `${USER_COLLECTIONS_TABLE}.createdAt`,
    `${USER_COLLECTIONS_TABLE}.updatedAt`,
    `${USERS_TABLE}.firstName as userFirstName`,
    `${USERS_TABLE}.lastName as userLastName`,
    `${COLLECTIONS_TYPES_TABLE}.slug as typeSlug`,
    `${COLLECTIONS_TYPES_TABLE}.label as typeLabel`,
    `${COLLECTIONS_TYPES_TABLE}.flavor as typeFlavor`,
];

const DEFAULT_USER_ROLE = 'member';
const ADMIN_USER_ROLE = 'admin';

const PUBLIC_COLLECTION_VISIBILITY = 'community';
const SHARED_COLLECTION_VISIBILITY = 'shared';
const PRIVATE_COLLECTION_VISIBILITY = 'private';

const OAUTH_PROVIDERS_ENUM = ['dummy', 'github', 'linkedin', 'orcid', 'mpds', 'basf'];
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
const deleteUserCollection = deleteFirstByUserId(USER_COLLECTIONS_TABLE, ['id']);
const insertUserDataSource = insertByUserId(USER_DATASOURCES_TABLE);
const insertUserCalculation = insertByUserId(USER_CALCULATIONS_TABLE);
const insertUserCollection = insertByUserId(USER_COLLECTIONS_TABLE, ['id']);
const upsertUserCollection = upsertByUserId(USER_COLLECTIONS_TABLE, ['id']);
const updateUserCollection = updateByUserId(USER_COLLECTIONS_TABLE, ['id']);
const selectDataSourceByUserId = selectFirstByUserId(USER_DATASOURCES_TABLE);

module.exports = {
    db,
    hashString,
    selectFirstUser,
    compareStringHash,

    selectUserDataSources,
    selectDataSourcesIdMap,
    insertUserDataSource,
    deleteUserDataSource,
    delsertDataSourceCollections,
    selectDataSourceByUserId, // ??
    selectDataSourcesByUserId, // ??

    selectUserCollections,
    insertUserCollection,
    updateUserCollection,
    upsertUserCollection,
    deleteUserCollection,
    delsertSharedCollectionUsers,
    delsertCollectionDataSources,
    selectCollectionTypes,

    selectUserCalculations,
    insertUserCalculation,
    deleteUserCalculation,
    selectCalculationsByUserId,
    selectCalculationsByUserIdAndRole,

    searchUsers,
    upsertUser,
    selectUsersByIds,
    selectUserByApiToken,
    selectLogs,
    selectUserRole,

    OAUTH_PROVIDERS_ENUM,
    VISIBILITY_ENUM,
    FLAVORS_ENUM,
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
    ADMIN_USER_ROLE,
    DEFAULT_USER_ROLE,
    PUBLIC_COLLECTION_VISIBILITY,
    SHARED_COLLECTION_VISIBILITY,
    PRIVATE_COLLECTION_VISIBILITY,
    USER_API_TOKENS_TABLE,
    LOGS_TABLE,
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

async function selectUserCalculations(user, query) {
    const { collectionIds, dataSourceIds, offset, limit, visibility, type } = prepareQuery(query);

    const model = db(USER_CALCULATIONS_TABLE).where((builder) => {
        if (user.roleSlug !== ADMIN_USER_ROLE)
            builder.where(`${USER_CALCULATIONS_TABLE}.userId`, user.id);
    });

    const count = await model.clone().count().countDistinct(`${USER_CALCULATIONS_TABLE}.id`);
    const total = +count[0]['count'];

    const data = await model
        .clone()
        .select(...DEFAULT_FIELDS)
        .distinctOn(`${USER_CALCULATIONS_TABLE}.id`)
        .orderBy(`${USER_CALCULATIONS_TABLE}.id`, 'desc')
        .groupBy(`${USER_CALCULATIONS_TABLE}.id`)
        .limit(limit || total)
        .offset(offset || 0);

    const types = await db.select().from(COLLECTIONS_TYPES_TABLE);

    return { data, total, types };
}

async function selectUserDataSources(user, query) {
    const { collectionIds, dataSourceIds, offset, limit, visibility, type } = prepareQuery(query);

    const model = db(USER_DATASOURCES_TABLE)
        .leftJoin(
            USER_COLLECTIONS_DATASOURCES_TABLE,
            `${USER_DATASOURCES_TABLE}.id`,
            `${USER_COLLECTIONS_DATASOURCES_TABLE}.dataSourceId`
        )
        .leftJoin(
            USER_COLLECTIONS_TABLE,
            `${USER_COLLECTIONS_DATASOURCES_TABLE}.collectionId`,
            `${USER_COLLECTIONS_TABLE}.id`
        )
        .leftJoin(
            USER_SHARED_COLLECTIONS_TABLE,
            `${USER_COLLECTIONS_DATASOURCES_TABLE}.collectionId`,
            `${USER_SHARED_COLLECTIONS_TABLE}.collectionId`
        )
        .leftJoin(
            COLLECTIONS_TYPES_TABLE,
            `${USER_COLLECTIONS_TABLE}.typeId`,
            `${COLLECTIONS_TYPES_TABLE}.id`
        )
        .innerJoin(USERS_TABLE, `${USER_DATASOURCES_TABLE}.userId`, `${USERS_TABLE}.id`)
        .innerJoin(
            USERS_EMAILS_TABLE,
            `${USER_DATASOURCES_TABLE}.userId`,
            `${USERS_EMAILS_TABLE}.userId`
        )
        .where((builder) => {
            if (user.roleSlug !== ADMIN_USER_ROLE)
                builder
                    .where(`${USER_DATASOURCES_TABLE}.userId`, user.id)
                    .orWhere(`${USER_SHARED_COLLECTIONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_COLLECTIONS_TABLE}.visibility`, PUBLIC_COLLECTION_VISIBILITY);
        })
        .where((builder) => {
            if (type) builder.where(`${COLLECTIONS_TYPES_TABLE}.id`, type);
            if (visibility) builder.where(`${USER_COLLECTIONS_TABLE}.visibility`, visibility);
            if (collectionIds.length)
                builder.whereIn(`${USER_COLLECTIONS_TABLE}.id`, collectionIds);
            if (dataSourceIds.length)
                builder.whereIn(`${USER_DATASOURCES_TABLE}.id`, dataSourceIds);
        });

    const count = await model.clone().count().countDistinct(`${USER_DATASOURCES_TABLE}.id`);
    const total = +count[0]['count'];

    const data = await model
        .clone()
        .select(...DATASOURCE_FIELDS)
        .distinctOn(`${USER_DATASOURCES_TABLE}.id`)
        .orderBy(`${USER_DATASOURCES_TABLE}.id`, 'desc')
        .groupBy(
            `${USER_DATASOURCES_TABLE}.id`,
            `${USERS_TABLE}.firstName`,
            `${USERS_TABLE}.lastName`,
            `${USERS_EMAILS_TABLE}.email`
        )
        .limit(limit || total)
        .offset(offset || 0);

    const types = await db.select().from(COLLECTIONS_TYPES_TABLE);

    return { data, total, types };
}

/**
 * Returns a map of datasource IDs and their corresponding UUIDs.
 *
 * @async
 * @function selectDataSourcesIdMap
 * @param {number[]} ids - An array of datasource IDs to query. Optional.
 * @param {string[]} uuids - An array of datasource UUIDs to query. Optional.
 * @returns {Promise<Map.<number, string>>} A map of datasource IDs and their corresponding UUIDs.
 */
async function selectDataSourcesIdMap(ids = [], uuids = []) {
    if (!ids.length && !uuids.length) return {};
    const idField = `${USER_DATASOURCES_TABLE}.id`;
    const uuidField = `${USER_DATASOURCES_TABLE}.uuid`;
    const data = await db(USER_DATASOURCES_TABLE)
        .select(idField, uuidField)
        .where((builder) => {
            if (ids.length) builder.orWhereIn(idField, ids);
            if (uuids.length) builder.orWhereIn(uuidField, uuids);
        });
    return new Map(data.map(({ id, uuid }) => [id, uuid]));
}

async function selectUserCollections(user, query) {
    const { collectionIds, dataSourceIds, offset, limit, visibility, type } = prepareQuery(query);

    const model = db(USER_COLLECTIONS_TABLE)
        .innerJoin(USERS_TABLE, `${USER_COLLECTIONS_TABLE}.userId`, `${USERS_TABLE}.id`)
        .leftJoin(
            USER_SHARED_COLLECTIONS_TABLE,
            `${USER_COLLECTIONS_TABLE}.id`,
            `${USER_SHARED_COLLECTIONS_TABLE}.collectionId`
        )
        .leftJoin(
            COLLECTIONS_TYPES_TABLE,
            `${USER_COLLECTIONS_TABLE}.typeId`,
            `${COLLECTIONS_TYPES_TABLE}.id`
        )
        .leftJoin(
            USER_COLLECTIONS_DATASOURCES_TABLE,
            `${USER_COLLECTIONS_TABLE}.id`,
            `${USER_COLLECTIONS_DATASOURCES_TABLE}.collectionId`
        )
        .where((builder) => {
            if (user.roleSlug !== ADMIN_USER_ROLE)
                builder
                    .where(`${USER_COLLECTIONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_SHARED_COLLECTIONS_TABLE}.userId`, user.id)
                    .orWhere(`${USER_COLLECTIONS_TABLE}.visibility`, PUBLIC_COLLECTION_VISIBILITY);
        })
        .where((builder) => {
            if (type) builder.where(`${COLLECTIONS_TYPES_TABLE}.id`, type);
            if (visibility) builder.where(`${USER_COLLECTIONS_TABLE}.visibility`, visibility);
            if (collectionIds.length)
                builder.whereIn(`${USER_COLLECTIONS_TABLE}.id`, collectionIds);
            if (dataSourceIds.length)
                builder.whereIn(
                    `${USER_COLLECTIONS_DATASOURCES_TABLE}.dataSourceId`,
                    dataSourceIds
                );
        });

    const count = await model.clone().countDistinct(`${USER_COLLECTIONS_TABLE}.id`);
    const total = +count[0]['count'];

    const data = await model
        .clone()
        .select(...COLLECTION_JOINED_FIELDS)
        .distinctOn(`${USER_COLLECTIONS_TABLE}.id`)
        .orderBy(`${USER_COLLECTIONS_TABLE}.id`, 'desc')
        .groupBy(
            `${USER_COLLECTIONS_TABLE}.id`,
            `${COLLECTIONS_TYPES_TABLE}.label`,
            `${COLLECTIONS_TYPES_TABLE}.slug`,
            `${COLLECTIONS_TYPES_TABLE}.flavor`,
            `${USERS_TABLE}.firstName`,
            `${USERS_TABLE}.lastName`
        )
        .limit(limit || total)
        .offset(offset || 0);

    // .select([
    //     ...COLLECTION_JOINED_FIELDS,
    //     db.raw(`ARRAY_AGG(DISTINCT ${USER_COLLECTIONS_DATASOURCES_TABLE}."dataSourceId") as "dataSources"`),
    //     db.raw(`COALESCE(ARRAY_AGG(DISTINCT ${USER_SHARED_COLLECTIONS_TABLE}."userId")
    //         FILTER (WHERE ${USER_SHARED_COLLECTIONS_TABLE}."userId" IS NOT NULL)) as "users"`),
    // ])

    const types = await db.select().from(COLLECTIONS_TYPES_TABLE);

    return { data, total, types };
}

async function delsertCollectionDataSources(collectionId, dataSourceIds) {
    if (dataSourceIds.length) {
        const deleted = await db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .where('collectionId', collectionId)
            .whereNotIn('dataSourceId', dataSourceIds)
            .del();

        const inserts = dataSourceIds.map((dataSourceId) => ({ dataSourceId, collectionId }));

        return db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .insert(inserts, ['dataSourceId'])
            .onConflict(['collectionId', 'dataSourceId'])
            .ignore();
    } else {
        const deleted = await db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .where('collectionId', collectionId)
            .del();
        return [];
    }
}

async function delsertDataSourceCollections(dataSourceId, collectionIds) {
    if (collectionIds.length) {
        const deleted = await db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .where('dataSourceId', dataSourceId)
            .whereNotIn('collectionId', collectionIds)
            .del();

        const inserts = collectionIds.map((collectionId) => ({ dataSourceId, collectionId }));

        return db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .insert(inserts, ['collectionId'])
            .onConflict(['collectionId', 'dataSourceId'])
            .ignore();
    } else {
        const deleted = await db(USER_COLLECTIONS_DATASOURCES_TABLE)
            .where('dataSourceId', dataSourceId)
            .del();
        return [];
    }
}

async function delsertSharedCollectionUsers(collectionId, userIds) {
    if (userIds.length) {
        const deleted = await db(USER_SHARED_COLLECTIONS_TABLE)
            .where('collectionId', collectionId)
            .whereNotIn('userId', userIds)
            .del();

        const inserts = userIds.map((userId) => ({ userId, collectionId }));

        return db(USER_SHARED_COLLECTIONS_TABLE)
            .insert(inserts, ['userId'])
            .onConflict(['userId', 'collectionId'])
            .ignore();
    } else {
        const deleted = await db(USER_SHARED_COLLECTIONS_TABLE)
            .where('collectionId', collectionId)
            .del();
        return [];
    }
}

function selectFirstUser(query = {}) {
    return db(USERS_TABLE)
        .leftJoin(USER_ROLES_TABLE, `${USERS_TABLE}.roleId`, `${USER_ROLES_TABLE}.id`)
        .leftJoin(USERS_EMAILS_TABLE, `${USERS_TABLE}.id`, `${USERS_EMAILS_TABLE}.userId`)
        .leftJoin(USERS_OAUTHS_TABLE, `${USERS_TABLE}.id`, `${USERS_OAUTHS_TABLE}.userId`)
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
            await db(USERS_OAUTHS_TABLE)
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
    return db.select().from(COLLECTIONS_TYPES_TABLE);
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

function prepareQuery(query) {
    if (query) {
        const { collectionIds, dataSourceIds, page, limit, type, visibility } = query;
        return {
            collectionIds: collectionIds
                ? collectionIds.includes(',')
                    ? collectionIds.split(',')
                    : [collectionIds]
                : [],
            dataSourceIds: dataSourceIds || [],
            offset: +page ? (page - 1) * limit : 0,
            limit,
            type,
            visibility,
        };
    } else
        return {
            collectionIds: [],
            dataSourceIds: [],
            offset: 0,
            limit: 0,
            visibility: '',
            type: '',
        };
}

function selectUserByApiToken(token) {
    return db(USERS_TABLE)
        .innerJoin(USER_API_TOKENS_TABLE, `${USERS_TABLE}.id`, `${USER_API_TOKENS_TABLE}.userId`)
        .select(`${USERS_TABLE}.*`)
        .where(`${USER_API_TOKENS_TABLE}.token`, token)
        .first();
}

async function selectLogs(opts = {}) {
    const { limit, offset, type, userIds, after } = opts;
    let query = db(LOGS_TABLE).select();

    if (type) {
        query = query.where('type', type);
    }

    if (userIds) {
        query = query.whereIn('userId', userIds);
    }

    if (after) {
        query = query.where('createdAt', '>', after);
    }

    return (
        await query
            .limit(limit || 1000)
            .offset(offset || 0)
            .orderBy('createdAt', 'desc')
    ).reverse();
}

function selectUserRole(userId) {
    return db(USER_ROLES_TABLE)
        .select(`${USER_ROLES_TABLE}.*`)
        .join(USERS_TABLE, `${USERS_TABLE}.roleId`, `${USER_ROLES_TABLE}.id`)
        .where(`${USERS_TABLE}.id`, userId)
        .first();
}
