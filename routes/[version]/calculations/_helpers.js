const { db,
    USER_DATASOURCES_TABLE,
    insertUserDataSource,
    insertUserCalculation,
    deleteUserCalculation,
    selectDataSourceByUserId,
    selectUserCollections,
    delsertDataSourceCollections
} = require('../../../services/db');

const { runCalculation, getCalculations, cancelCalculation } = require('../../../services/backend');
const { getAndPrepareDataSources } = require('../datasources/_helpers');

module.exports = {
    deleteAndClearCalculation,
    getAndPrepareCalculations,
    getAndPrepareCalcResults,
    runAndSaveCalculation,
};

async function runAndSaveCalculation(userId, dataId, engine, input, workflow, updateHook) {
    const datasource = await selectDataSourceByUserId(userId, { id: dataId });

    if (!datasource || !datasource.uuid) {
        throw 'Data source UUID is not available';
    }

    const { data = {} } = await runCalculation(datasource.uuid, engine, input, workflow, updateHook);

    if (!data.uuid) {
        throw 'Calculation UUID is not available';
    }

    return insertUserCalculation(userId, { uuid: data.uuid });
}

async function getAndPrepareCalculations(calculations = { data: [], total: 0 }) {
    const { uuids, calc } = calculations.data.reduce(
        (acc, { uuid, ...other }) => {
            acc.uuids.push(uuid);
            acc.calc.push(other);
            return acc;
        },
        { uuids: [], calc: [] }
    );

    if (!uuids.length) return { data: [], total: 0 };

    const { data = [] } = await getCalculations(uuids);

    if (!data.length) return { data: [], total: 0 };

    calculations.data = data.reduce((acc, { uuid, ...data }) => {
        const i = uuids.indexOf(uuid);
        acc.push(Object.assign(data, calc[i]));
        return acc;
    }, []);

    return calculations;
}

async function getAndPrepareCalcResults(userId, calculations, progress, result) {
    const output = await getAndPrepareCalculations(calculations);

    let dataSources = { data: [], total: 0 },
        results = [];

    if (result) {
        for (const data of result) {
            const { parent, uuid } = data;
            if (!parent || !uuid)
                return { error: 'Invalid result given' };

            // result database processing
            const { id } = await db(USER_DATASOURCES_TABLE).where({ uuid: parent }).first('id');
            if (!id) return { error: 'Absent parent datasource' };

            const parentCollections = await selectUserCollections({ id: userId }, { dataSourceIds: [id] });
            const collectionIds = parentCollections.data.map(({ id }) => id);
            const dataSource = await insertUserDataSource(userId, { uuid });

            await delsertDataSourceCollections(dataSource.id, collectionIds);

            dataSources.data.push(dataSource);
        }

        // get & prepare result datasources from sci. backend
        const preparedData = await getAndPrepareDataSources(dataSources);
        results = preparedData.data.map(dataSource => ({ ...dataSource, progress }));
    }

    // mix results to calculations output
    if (results.length)
        output.data.push(...results);

    return output;
}

async function deleteAndClearCalculation(userId, id) {
    const { uuid } = await deleteUserCalculation(userId, id);
    await cancelCalculation(uuid);
    return uuid;
}
