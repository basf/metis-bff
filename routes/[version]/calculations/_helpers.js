const { StatusCodes } = require('http-status-codes');

const {
    USER_DATASOURCES_TABLE,
    insertUserDataSource,
    insertUserCalculation,
    deleteUserCalculation,
    selectDataSourceByUserId,
    selectUserCollectionsByDataSources,
    delsertDataSourceCollections
} = require('../../../services/db');

const { runCalculation, getCalculations, cancelCalculation } = require('../../../services/backend');
const { getAndPrepareDataSources } = require('../datasources/_helpers');

module.exports = {
    deleteAndClearCalculation,
    getAndPrepareCalculations,
    getAndPrepareCalculationsWithResult,
    runAndSaveCalculation,
};

async function runAndSaveCalculation(userId, dataId, engine, input, updateHook) {
    const datasource = await selectDataSourceByUserId(userId, { id: dataId });

    if (!datasource || !datasource.uuid) {
        throw 'Data Source UUID is not available';
    }

    const { data = {} } = await runCalculation(datasource.uuid, engine, input, updateHook);

    if (!data.uuid) {
        throw 'Calculation UUID is not available';
    }

    return insertUserCalculation(userId, { uuid: data.uuid });
}

async function getAndPrepareCalculations(calculations = []) {
    const { uuids, calc } = calculations.reduce(
        (acc, { uuid, ...other }) => {
            acc.uuids.push(uuid);
            acc.calc.push(other);
            return acc;
        },
        { uuids: [], calc: [] }
    );

    if (!uuids.length) return [];

    const { data = [] } = await getCalculations(uuids);

    if (!data.length) return [];

    return data.reduce((acc, { uuid, ...data }) => {
        const i = uuids.indexOf(uuid);
        acc.push(Object.assign(data, calc[i]));
        return acc;
    }, []);
}

async function getAndPrepareCalculationsWithResult(userId, uuid, calculations, result) {
    let dataSources = [];
    const output = await getAndPrepareCalculations(calculations);
    try {
        // result processing
        for (const data of result) {
            const { parent, uuid } = data;
            const parentDataSourceId = await db(USER_DATASOURCES_TABLE).where({ uuid: parent }).first('id');
            const parentCollections = await selectUserCollectionsByDataSources(userId, [parentDataSourceId]);
            const dataSource = await insertUserDataSource(userId, { uuid });
            const dataSourceCollections = await delsertDataSourceCollections(dataSource.id, parentCollections);
            dataSources.push(dataSource);
        }
        // prepare result datasources without uuids
        result = await getAndPrepareDataSources(dataSources);
        // add result to calculations SSE output
        const calcId = calculations.find(c => c.uuid === uuid).id;
        return output.map(calc => calc.id === calcId ? { ...calc, result } : calc);
    } catch (error) {
        return next({ status: StatusCodes.UNPROCESSABLE_ENTITY, error });
    }
}

async function deleteAndClearCalculation(userId, id) {
    const { uuid } = await deleteUserCalculation(userId, id);
    await cancelCalculation(uuid);
    return uuid;
}
