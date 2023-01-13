const { StatusCodes } = require('http-status-codes');

const {
    db,
    USER_CALCULATIONS_TABLE,
    USER_DATASOURCES_TABLE,
    selectCalculationsByUserId,
    insertUserCalculation,
} = require('../../../services/db');

const { is_valid_uuid } = require('./_helpers');
const { getAndPrepareCalculations } = require('../calculations/_helpers');

module.exports = {
    post,
};

async function post(req, res, next) {
    const { uuid, parent } = req.body;

    if (!uuid || !is_valid_uuid(uuid) || !parent) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(StatusCodes.ACCEPTED).json({ reqId: req.id });

    const exists = await db.select().from(USER_CALCULATIONS_TABLE).where({ uuid }).first();
    if (exists) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Calculation exists for provided UUID',
        });
    }

    const user = await db
        .select('userId')
        .from(USER_DATASOURCES_TABLE)
        .where('uuid', parent)
        .first();
    if (!user) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Orphaned calculation UUID',
        });
    }

    await insertUserCalculation(user.userId, { uuid });
    const calculations = await selectCalculationsByUserId(user.userId);
    const output = await getAndPrepareCalculations(calculations);

    res.sse.send(
        ({ session }) => {
            return user.userId && session.passport && user.userId === session.passport.user;
        },
        { reqId: req.id, data: output },
        'calculations'
    );
}
