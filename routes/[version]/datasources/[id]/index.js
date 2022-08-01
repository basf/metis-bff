const { StatusCodes } = require('http-status-codes');

const { selectUserDataSources } = require('../../../../services/db');

const { checkAuth } = require('../../../../middlewares/auth');
const { getUserDataSources } = require('../../../../middlewares/db');

const { deleteAndClearDataSource, getAndPrepareDataSources } = require('../_helpers');

module.exports = {
    delete: [checkAuth, getUserDataSources, del],
};

async function del(req, res, next) {
    if (!req.params.id) {
        return next({ status: StatusCodes.BAD_REQUEST });
    }

    const reqId = req.id;

    res.status(StatusCodes.ACCEPTED).json({ reqId });

    try {
        await deleteAndClearDataSource(req.user.id, req.params.id);

        req.session.datasources.data = req.session.datasources.data.filter(
            (datasource) => datasource.id !== req.params.id
        );

        if (req.session.datasources.data.length <= 1) {
            const page = +req.query.page <= 1 ? 1 : +req.query.page - 1;
            req.session.datasources = await selectUserDataSources(req.user, { ...req.query, page });
        }

        const data = await getAndPrepareDataSources(req.session.datasources);

        res.sse.sendTo({ reqId, ...data }, 'datasources');
    } catch (error) {
        return next({ status: StatusCodes.MISDIRECTED_REQUEST, error });
    }
}
