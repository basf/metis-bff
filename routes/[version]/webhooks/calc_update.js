const { StatusCodes } = require('http-status-codes');

const { db,
    USER_CALCULATIONS_TABLE,
    selectCalculationsByUserId,
} = require('../../../services/db');

const { is_valid_uuid } = require('./_helpers');
const { getAndPrepareCalcResults, deleteAndClearCalculation } = require('../calculations/_helpers');

module.exports = {
    post,
};

async function post(req, res, next) {
    const { uuid, progress, result } = req.body;

    if (!uuid || !is_valid_uuid(uuid) || !progress) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(StatusCodes.ACCEPTED).json({ reqId: req.id });

    const calculation = await db.select().from(USER_CALCULATIONS_TABLE).where({ uuid }).first();
    if (!calculation) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Calculation is not available for provided UUID',
        });
    }

    const userId = calculation.userId;
    const calculations = await selectCalculationsByUserId(userId);
    const output = await getAndPrepareCalcResults(userId, calculations, progress, result);

    if (output.error) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error: output.error });
    }

    res.sse.send(
        ({ session }) => {
            return userId && session.passport && userId === session.passport.user;
        },
        { reqId: req.id, data: output },
        'calculations'
    );

    if (progress == 100) await deleteAndClearCalculation(userId, calculation.id); // TODO?
}
