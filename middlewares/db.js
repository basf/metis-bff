const { StatusCodes } = require('http-status-codes');

const {
    COLLECTONS_TYPES_TABLE,
    SHARED_COLLECTION_VISIBILITY,
    USER_SHARED_COLLECTONS_TABLE,
    USER_COLLECTONS_DATASOURCES_TABLE,
    db,
    selectCollections,
    selectDataSources,
    // selectDataSourcesByUserIdAndRole,
    // selectCollectionsByUserIdAndRole,
    selectCalculationsByUserIdAndRole
} = require('../services/db');

module.exports = {
    getUserCollections,
    getUserDataSources,
    getUserCalculations,
};

async function getUserDataSources(req, res, next) {
    try {
        const { collectionIds, page, limit } = req.query;
        const query = {
            collectionIds: collectionIds ? collectionIds.includes(',')
                ? collectionIds.split(',')
                : [collectionIds] : [],
            offset: (page - 1) * limit,
            limit
        };

        req.session.datasources = await selectDataSources(req.user, query);
    } catch (error) {
        return next({ error });
    }

    if (!req.session.datasources) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Data sources are not available',
        });
    }

    return next();
}

async function getUserCalculations(req, res, next) {
    try {
        req.session.calculations = await selectCalculationsByUserIdAndRole(
            req.user.id,
            req.user.roleSlug
        );
    } catch (error) {
        return next({ error });
    }

    if (!req.session.calculations) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Calculations are not available',
        });
    }

    return next();
}

async function getUserCollections(req, res, next) {
    const { collectionIds, page, limit, visibility, type } = req.query;
    const query = {
        collectionIds: collectionIds ? collectionIds.includes(',')
            ? collectionIds.split(',')
            : [collectionIds] : [],
        offset: (page - 1) * limit,
        limit,
        visibility,
        type
    };

    try {
        const collections = await selectCollections(req.user, query);
        console.log(await selectCollections(req.user, { dataSourceIds: [61, 62, 63] }));
        const collectionIds = collections.data.map(({ id }) => id);
        const collectionTypeIds = collections.data.map(({ typeId }) => typeId);
        const sharedCollectionIds = collections.data.reduce((ids, { visibility, id }) => {
            if (visibility === SHARED_COLLECTION_VISIBILITY) ids.push(id);
            return ids;
        }, []);

        collections.types = await db.select().from(COLLECTONS_TYPES_TABLE).whereIn('id', collectionTypeIds);

        let dataSources = collectionIds.length
            ? await db(USER_COLLECTONS_DATASOURCES_TABLE).whereIn('collectionId', collectionIds)
            : [];

        let users = sharedCollectionIds.length
            ? await db(USER_SHARED_COLLECTONS_TABLE).whereIn('collectionId', sharedCollectionIds)
            : [];

        for (let collection of collections.data) {
            collection.dataSources = [];
            dataSources = dataSources.filter(({ dataSourceId, collectionId }) => {
                const related = collectionId === collection.id;
                related && collection.dataSources.push(dataSourceId);
                return !related;
            });

            collection.users = null;

            if (collection.visibility === SHARED_COLLECTION_VISIBILITY) {
                collection.users = [];
                users = users.filter(({ userId, collectionId }) => {
                    const related = collectionId === collection.id;
                    related && collection.users.push(userId);
                    return !related;
                });
            }
        }

        req.session.collections = collections || [];
    } catch (error) {
        return next({ error });
    }

    if (!req.session.collections) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Collections are not available',
        });
    }

    return next();
}
