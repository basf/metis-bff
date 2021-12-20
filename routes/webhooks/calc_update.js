const { StatusCodes } = require('http-status-codes');

const cache = require('../../services/sseCache');
const { db, USER_CALCULATIONS_TABLE, selectCalculationsByUserId } = require('../../services/db');

const { getAndPrepareCalculations } = require('../calculations/_helpers');

module.exports = {
    post,
};

async function post(req, res, next) {

    const { uuid } = req.body;

    if (!uuid || !status) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(202).json({});

    const calculation = await db.select().from(USER_CALCULATIONS_TABLE).where({ uuid }).first();

    if (!calculation) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error: 'Calculation are not available for provided UUID' });
    }

    const userId = calculation.userId;

    if (cache.has(userId)) {
        const sse = cache.get(ctx.userId);

        const calculations = await selectCalculationsByUserId(userId);
        const output = await getAndPrepareCalculations(calculations);

        sse.send(output, 'calculations');
    }
}