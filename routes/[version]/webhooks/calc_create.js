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

/**
 * @api {post} /v0/webhooks/calc_create Create a new calculation in a workflow
 * @apiName CreateCalculation
 * @apiGroup Calculations
 * @apiPermission unprotected
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
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

    const sseFilter = ({ session, user }) =>
          session?.passport?.user === user.userId || user?.id === user.userId;
    res.sse.send(sseFilter, { reqId: req.id, data: output }, 'calculations');
}
