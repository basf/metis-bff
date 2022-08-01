const { StatusCodes } = require('http-status-codes');

const {
    selectUserDataSources,
    selectUserCollections,
    selectUserCalculations
} = require('../services/db');

module.exports = {
    getUserDataSources,
    getUserCollections,
    getUserCalculations,
};

async function getUserDataSources(req, res, next) {
    try {
        req.session.datasources = await selectUserDataSources(req.user, req.query);
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
        req.session.calculations = await selectUserCalculations(req.user, req.query);
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
        req.session.collections = await selectUserCollections(req.user, req.query);
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
