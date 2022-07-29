const { StatusCodes } = require('http-status-codes');

const {
    selectUserCollections,
    selectUserDataSources,
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
            ...req.query,
            collectionIds: collectionIds ? collectionIds.includes(',')
                ? collectionIds.split(',')
                : [collectionIds] : [],
            offset: (page - 1) * limit,
        };

        req.session.datasources = await selectUserDataSources(req.user, query);
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
        const { collectionIds, page, limit } = req.query;
        const query = {
            ...req.query,
            collectionIds: collectionIds ? collectionIds.includes(',')
                ? collectionIds.split(',')
                : [collectionIds] : [],
            offset: (page - 1) * limit,
        };

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
        const { collectionIds, page, limit } = req.query;
        const query = {
            ...req.query,
            collectionIds: collectionIds ? collectionIds.includes(',')
                ? collectionIds.split(',')
                : [collectionIds] : [],
            offset: (page - 1) * limit,
        };

        req.session.collections = await selectUserCollections(req.user, query);
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
