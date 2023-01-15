const { StatusCodes } = require('http-status-codes');

const { selectUserCalculations } = require('../../../services/db');

const { checkAuth } = require('../../../middlewares/auth');
const { getUserCalculations } = require('../../../middlewares/db');

const { deleteAndClearCalculation, getAndPrepareCalculations } = require('./_helpers');

module.exports = {
    delete: [checkAuth, getUserCalculations, del],
};

async function del(req, res, next) {
    if (!req.params.id) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        await deleteAndClearCalculation(req.user.id, req.params.id);

        req.session.calculations.data = req.session.calculations.data.filter(
            (calculation) => calculation.id !== req.params.id
        );

        if (req.session.calculations.data.length <= 1) {
            const page = +req.query.page <= 1 ? 1 : +req.query.page - 1;
            req.session.calculations = await selectUserCalculations(req.user, {
                ...req.query,
                page,
            });
        }

        const data = await getAndPrepareCalculations(req.session.calculations);

        res.sse.sendTo({ reqId, ...data }, 'calculations');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
