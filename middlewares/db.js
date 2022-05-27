const { StatusCodes } = require('http-status-codes');

const {
    SHARED_COLLECTION_VISIBILITY,
    USER_SHARED_COLLECTONS_TABLE,
    USER_COLLECTONS_DATASOURCES_TABLE,
    db,
    selectDataSourcesByUserIdAndRole,
    selectCollectionsByUserIdAndRole,
    selectCalculationsByUserIdAndRole,
    selectUserDataSourcesByCollections
} = require('../services/db');

module.exports = {
    getUserCollections,
    getUserDataSources,
    getUserCalculations,
};

async function getUserDataSources(req, res, next) {
    try {
        if ('collectionIds' in req.query && req.query.collectionIds) {
            const collectionIds = req.query.collectionIds.includes(',')
                ? req.query.collectionIds.split(',')
                : [req.query.collectionIds];
            req.session.datasources = await selectUserDataSourcesByCollections(
                req.user.id,
                collectionIds
            );
        } else {
            req.session.datasources = await selectDataSourcesByUserIdAndRole(
                req.user.id,
                req.user.roleSlug
            );
        }
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
    try {
        const collections = await selectCollectionsByUserIdAndRole(req.user.id, req.user.roleSlug);

        const collectionIds = collections.map(({ id }) => id);
        const sharedCollectionIds = collections.reduce((ids, { visibility, id }) => {
            if (visibility === SHARED_COLLECTION_VISIBILITY) ids.push(id);
            return ids;
        }, []);

        let dataSources = collectionIds.length
            ? await db(USER_COLLECTONS_DATASOURCES_TABLE).whereIn('collectionId', collectionIds)
            : [];

        let users = sharedCollectionIds.length
            ? await db(USER_SHARED_COLLECTONS_TABLE).whereIn('collectionId', sharedCollectionIds)
            : [];

        for (let collection of collections) {
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
