const { StatusCodes } = require('http-status-codes');

const { db,
    USER_CALCULATIONS_TABLE,
    selectCalculationsByUserId,
} = require('../../../services/db');

const { getAndPrepareCalculations, getAndPrepareCalculationsWithResult } = require('../calculations/_helpers');

module.exports = {
    post,
};

function is_valid_uuid(uuid) {
    uuid = '' + uuid;
    uuid = uuid.match(
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    );
    return uuid !== null;
}

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
    const output = result
        ? await getAndPrepareCalculationsWithResult(userId, uuid, calculations, result)
        : await getAndPrepareCalculations(calculations);

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
}
