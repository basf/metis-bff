const { StatusCodes } = require('http-status-codes');

const { db, USER_CALCULATIONS_TABLE, selectCalculationsByUserId } = require('../../../services/db');

const { getAndPrepareCalculations } = require('../calculations/_helpers');

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
    const { uuid, status } = req.body;

    if (!uuid || !is_valid_uuid(uuid) || !status) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(StatusCodes.ACCEPTED).json({ reqId: req.id });

    const calculation = await db.select().from(USER_CALCULATIONS_TABLE).where({ uuid }).first();

    if (!calculation) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Calculation are not available for provided UUID',
        });
    }

    const userId = calculation.userId;

    const calculations = await selectCalculationsByUserId(userId);
    const output = await getAndPrepareCalculations(calculations);

    res.sse.send(
        ({ session }) => {
            return userId && session.passport && userId === session.passport.user;
        },
        output,
        'calculations'
    );
}
