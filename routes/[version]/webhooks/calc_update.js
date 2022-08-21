const { StatusCodes } = require('http-status-codes');

const { db,
    USER_CALCULATIONS_TABLE,
    USERS_TABLE,
    selectUserCalculations,
    selectUserDataSources,
    selectFirstUser
} = require('../../../services/db');

const { is_valid_uuid } = require('./_helpers');
const { getAndPrepareCalcResults, deleteAndClearCalculation } = require('../calculations/_helpers');

const { getAndPrepareDataSources } = require('../datasources/_helpers');

module.exports = { post };

let query = null;

async function post(req, res, next) {
    const { uuid, progress, result } = req.body;

    if (req.query.limit) {
        query = req.query;
        // query.page = 1;
        return next({ status: StatusCodes.ACCEPTED });
    }

    if (!uuid || !is_valid_uuid(uuid) || !progress) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    res.status(StatusCodes.ACCEPTED).json({ reqId: req.id });

    const { userId, id } = await db(USER_CALCULATIONS_TABLE).where({ uuid }).first('id', 'userId');

    if (!userId) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: 'Calculation is not available for provided UUID',
        });
    }

    const calculations = await selectUserCalculations({ id: userId });
    const output = await getAndPrepareCalcResults(userId, calculations, progress, result);

    if (output.error) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error: output.error });
    }

    res.sse.send(
        ({ session }) => {
            return userId && session.passport && userId === session.passport.user;
        },
        { reqId: req.id, ...output },
        'calculations'
    );

    if (output.data.some(({ progress }) => progress === 100)) {
        const user = await selectFirstUser({ [`${USERS_TABLE}.id`]: userId });
        const datasources = await selectUserDataSources(user, query);
        const preparedDataSouces = await getAndPrepareDataSources(datasources);

        res.sse.send(
            ({ session }) => {
                return userId && session.passport && userId === session.passport.user;
            },
            { reqId: req.id, ...preparedDataSouces },
            'datasources'
        );
    }

    if (progress === 100) setTimeout(async () => await deleteAndClearCalculation(userId, id), 3000);
}
