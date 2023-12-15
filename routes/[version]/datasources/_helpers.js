const {
    insertUserDataSource,
    deleteUserDataSource,
    selectDataSourcesIdMap,
    selectUserCollections,
    delsertDataSourceCollections,
} = require('../../../services/db');

const {
    createDataSource,
    getDataSources,
    deleteDataSource,
    importDataSource,
} = require('../../../services/backend');

module.exports = {
    createAndSaveDataSource,
    importAndSaveDataSource,
    getAndPrepareDataSources,
    deleteAndClearDataSource,
};

async function createAndSaveDataSource(userId, content, fmt, name) {
    const { data = {} } = await createDataSource(content, fmt, name);

    if (!data.uuid) {
        throw 'Datasource cannot be used';
    }

    return insertUserDataSource(userId, { uuid: data.uuid });
}

async function importAndSaveDataSource(userId, externalId, parentId) {
    let response;
    try {
        response = await importDataSource(externalId);
    } catch (error) {
        console.error(error);
    }

    if (!response) return false;

    if (!response.data.uuid) {
        throw 'Datasource cannot be used';
    }

    // collections inheritance
    const parentCollections = await selectUserCollections(
        { id: userId },
        { dataSourceIds: [parentId] }
    );
    const collectionIds = parentCollections.data.map(({ id }) => id);
    const dataSource = await insertUserDataSource(userId, { uuid: response.data.uuid });

    await delsertDataSourceCollections(dataSource.id, collectionIds);

    return dataSource;
}

/**
 * Retrieves data sources from both local and remote sources and prepares
 * them for display.
 * @async
 * @function getAndPrepareDataSources
 * @typedef {Object} datasources - The datasources object.
 * @property {Array} datasources.data=[] - The local data sources.
 * @property {Number} datasources.total=0 - Total number of datasources.
 * @param {datasources} - The datasources object.
 * @typedef {Object} result - Resulting object.
 * @property {Array} result.data - Array of data sources.
 * @property {Number} result.total - Total number of data sources.
 * @returns {Promise<result>} - The merged and prepared data sources.
 * @throws {Error} - If there is an error retrieving the remote data sources.
 * @example
 * const { data, total } = await getAndPrepareDataSources({ data: localDataSources });
 */
async function getAndPrepareDataSources({ data = [], total = 0 }) {
    if (!data.length) return { data: [], total: 0 };

    // Map UUIDs to local data sources
    const localDataSourcesMap = new Map(data.map(({ uuid, ...otherProps }) => [uuid, otherProps]));

    // Retrieve remote data sources from backend
    const { data: remoteDataSources = [] } = await getDataSources(
        Array.from(localDataSourcesMap.keys())
    );
    if (!remoteDataSources.length) return { data: [], total: 0 };

    // Retrieve mapping of UUIDs to local IDs for parents and children
    const relativeUUIDs = remoteDataSources.flatMap((x) => [
        ...(x.parents || []),
        ...(x.children || []),
    ]);
    const idToUUIDMap = await selectDataSourcesIdMap([], relativeUUIDs);
    const uuidToIDMap = new Map(Array.from(idToUUIDMap).map((x) => x.reverse()));

    // Merge remote and local data sources
    const merged = remoteDataSources.map(({ uuid, ...dataSource }) => ({
        ...dataSource,
        parents: (dataSource.parents || []).map((x) => uuidToIDMap.get(x)),
        children: (dataSource.children || []).map((x) => uuidToIDMap.get(x)),
        ...(localDataSourcesMap.get(uuid) || {}),
    }));
    return { data: merged, total };
}

async function deleteAndClearDataSource(userId, id) {
    const result = await deleteUserDataSource(userId, id);

    if (!result?.uuid) return false;

    await deleteDataSource(result.uuid);
    return true;
}
