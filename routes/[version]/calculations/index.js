const { StatusCodes } = require('http-status-codes');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCalculations } = require('../../../middlewares/db');

const { runAndSaveCalculation, getAndPrepareCalculations } = require('./_helpers');

const { webhooks } = require('../../../config');

module.exports = {
    get: [checkAuth, getUserCalculations, get],
    post: [checkAuth, getUserCalculations, post],
};

/**
 * @api {post} /v0/calculations Submit a new calculation
 * @apiName SubmitCalculation
 * @apiGroup Calculations
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function post(req, res, next) {
    if (!req.body.dataId) {
        return next({
            status: StatusCodes.BAD_REQUEST,
            error: 'Required field `dataId` is not provided.',
        });
    }

    const reqId = req.id,
        engine = req.body.engine,
        input = req.body.input || {},
        workflow = req.body.workflow;

    console.log('Got *engine* param:   ' + engine);
    console.log('Got *workflow* param: ' + workflow);

    /*if (req.session.calculations.data.length > 15) {
        return next({
            status: StatusCodes.PAYMENT_REQUIRED,
            error: 'Sorry, your computing resources quota is exceeded.',
        });
    }*/

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const updateHook = `${req.protocol}://${req.get('host')}${webhooks.calc_update}`;

        const calculation = await runAndSaveCalculation(
            req.user.id,
            req.body.dataId,
            engine,
            input,
            workflow,
            updateHook
        );

        req.session.calculations.data.push(calculation);

        const data = await getAndPrepareCalculations(req.session.calculations);

        res.sse.sendTo({ reqId, ...data }, 'calculations');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}

/**
 * @api {get} /v0/calculations List all user's calculations
 * @apiName ListCalculations
 * @apiGroup Calculations
 * @apiPermission API
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function get(req, res, next) {
    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        const data = await getAndPrepareCalculations(req.session.calculations);

        res.sse.sendTo({ reqId, ...data }, 'calculations');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
