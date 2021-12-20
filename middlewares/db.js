const { StatusCodes } = require('http-status-codes');

const { selectDataSourcesByUserId, selectCalculationsByUserId } = require('../services/db');

module.exports = {
    getUserDataSources,
    getUserCalculations,
};

async function getUserDataSources(req, res, next) {

    req.session.datasources = await selectDataSourcesByUserId(req.user.id);

    if (!req.session.datasources) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error: 'Data sources are not available' });
    }

    return next();
}

async function getUserCalculations(req, res, next) {

    req.session.calculations = await selectCalculationsByUserId(req.user.id);

    if (!req.session.calculations) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error: 'Calculations are not available' });
    }

    return next();
}