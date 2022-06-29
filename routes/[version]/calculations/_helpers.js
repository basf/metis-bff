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

async function getAndPrepareCalculationsWithResult(userId, calculations, progress, result) {
    const output = await getAndPrepareCalculations(calculations);

    let dataSources = [], results = [];

    try {
        if (result) {

            // result database processing
            for (const data of result) {
                const { parent, uuid } = data;
                const parentDataSource = await db(USER_DATASOURCES_TABLE).where({ uuid: parent }).first('id');
                const parentCollections = await selectUserCollectionsByDataSources(userId, [parentDataSource.id]);
                const dataSource = await insertUserDataSource(userId, { uuid });
                const collectionIds = parentCollections.map(({ id }) => id);
                const dataSourceCollections = await delsertDataSourceCollections(dataSource.id, collectionIds);
                dataSources.push(dataSource);
            }

            // get & prepare result datasources from scince server
            const preparedData = await getAndPrepareDataSources(dataSources);
            results = preparedData.map(dataSource => ({ ...dataSource, progress }));
        }

        // mix results to calculations output
        return [...output, { data: results }];

    } catch (error) {
        return { error };
    }
}

async function deleteAndClearCalculation(userId, id) {
    const { uuid } = await deleteUserCalculation(userId, id);
    await cancelCalculation(uuid);
    return uuid;
}
