const { StatusCodes } = require('http-status-codes');

const { db,
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
        throw 'Data source UUID is not available';
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
            const parentDataSource = await db(USER_DATASOURCES_TABLE).where({ uuid: parent }).first('id');
            const parentCollections = await selectUserCollectionsByDataSources(userId, [parentDataSource.id]);
            const dataSource = await insertUserDataSource(userId, { uuid });
            const dataSourceCollections = await delsertDataSourceCollections(dataSource.id, parentCollections);
            dataSources.push(dataSource);
        }
        // prepare result datasources without uuids
        const prepared = await getAndPrepareDataSources(dataSources);
        // add prepared to calculations SSE output
        const calcId = calculations.find(c => c.uuid === uuid).id;
        return output.map(calc => calc.id === calcId ? { ...calc, prepared } : calc);

    } catch (error) {
        return { error }
    }
}

async function deleteAndClearCalculation(userId, id) {
    const { uuid } = await deleteUserCalculation(userId, id);
    await cancelCalculation(uuid);
    return uuid;
}
