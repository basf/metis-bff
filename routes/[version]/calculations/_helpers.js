const {
    db,
    USER_DATASOURCES_TABLE,
    insertUserDataSource,
    insertUserCalculation,
    deleteUserCalculation,
    selectDataSourceByUserId,
    selectDataSourcesIdMap,
    selectUserCollections,
    delsertDataSourceCollections,
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
        throw 'Datasource cannot be used';
    }

    const { data = {} } = await runCalculation(
        datasource.uuid,
        engine,
        input,
        workflow,
        updateHook
    );

    if (!data.uuid) {
        throw 'Calculation is not available';
    }

    return insertUserCalculation(userId, { uuid: data.uuid });
}

/**
 * Retrieves calculations from both local and remote sources and prepares
 * them for display.
 * @async
 * @function getAndPrepareCalculations
 * @typedef {Object} calculations - The calculations object.
 * @property {Array} calculations.data=[] - The local calculations.
 * @property {Number} calculations.total=0 - Total number of calculations.
 * @param {calculations} - The calculations objects.
 * @typedef {Object} result - Resulting object.
 * @property {Array} result.data - Array of calculations
 * @property {Number} result.total - Total number of calculations
 * @return {Promise<result>} - The merged and prepared calculations.
 * @throws {Error} - If there is an error retrieving the remote calculations.
 * @example
 * const { data, total } = await getAndPrepareCalculations({ data: localCalculations });
 */
async function getAndPrepareCalculations({ data = [], total = 0 }) {
    if (!data.length) return { data: [], total: 0 };

    // Map UUIDs to local calculations
    const localCalculationsMap = new Map(data.map(({ uuid, ...otherProps }) => [uuid, otherProps]));

    // Retrieve remote calculations from backend
    const { data: remoteCalculations = [] } = await getCalculations(
        Array.from(localCalculationsMap.keys())
    );
    if (!remoteCalculations.length) return { data: [], total: 0 };

    // Retrieve mapping of UUIDs to local IDs for parents (data sources)
    const relativeUUIDs = remoteCalculations.map(({ parent }) => parent).filter(Boolean);
    const idToUUIDMap = await selectDataSourcesIdMap([], relativeUUIDs);
    const uuidToIDMap = new Map(Array.from(idToUUIDMap).map((x) => x.reverse()));

    // Merge remote and local data sources
    const merged = remoteCalculations.map(({ uuid, parent, ...calculation }) => ({
        ...calculation,
        parent: uuidToIDMap.get(parent),
        ...(localCalculationsMap.get(uuid) || {}),
    }));
    return { data: merged, total };
}

async function getAndPrepareCalcResults(userId, calculations, progress, result) {
    const output = await getAndPrepareCalculations(calculations);

    let dataSources = { data: [], total: 0 },
        results = [];

    if (result) {
        for (const data of result) {
            const { parent, uuid } = data;
            if (!parent || !uuid) return { error: 'Invalid result given' };

            // result database processing
            const { id } = await db(USER_DATASOURCES_TABLE).where({ uuid: parent }).first('id');
            if (!id) return { error: 'Absent parent datasource' };

            // collections inheritance
            const parentCollections = await selectUserCollections(
                { id: userId },
                { dataSourceIds: [id] }
            );
            const collectionIds = parentCollections.data.map(({ id }) => id);
            const dataSource = await insertUserDataSource(userId, { uuid });

            await delsertDataSourceCollections(dataSource.id, collectionIds);

            dataSources.data.push(dataSource);
        }

        // get & prepare result datasources from backend
        const preparedData = await getAndPrepareDataSources(dataSources);
        results = preparedData.data.map((dataSource) => ({ ...dataSource, progress }));
    }

    // mix results to calculations output
    if (results.length) output.data.push(...results);

    return output;
}

async function deleteAndClearCalculation(userId, id) {
    const result = await deleteUserCalculation(userId, id);
    if (!result) return false;

    await cancelCalculation(result.uuid);
    return result.uuid;
}
