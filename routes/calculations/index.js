const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../middlewares/auth');
const { getUserCalculations } = require('../../middlewares/db');

const { runAndSaveCalculation, getAndPrepareCalculations } = require('./_helpers');

const { webhooks } = require('../../config');

module.exports = {
    get: [
        checkAuth,
        getUserCalculations,
        get,
    ],
    post: [
        checkAuth,
        getUserCalculations,
        post,
    ],
};

async function post(req, res, next) {

    if (!req.body.dataId) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(202).json({});

    try {
        const updateHook = `${req.protocol}://${req.get('host')}${webhooks.calc_update}`;

        const calculation = await runAndSaveCalculation(req.user.id, req.body.dataId, updateHook);

        req.session.calculations.push(calculation);

        const output = await getAndPrepareCalculations(req.session.calculations);

        res.sse.send(output, 'calculations');

    } catch(error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

async function get(req, res, next) {

    res.status(202).json({});

    try {
        const output = await getAndPrepareCalculations(req.session.calculations);

        res.sse.send(output, 'calculations');

    } catch(error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}