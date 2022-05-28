const { db,
    USER_DATASOURCES_TABLE,
    insertUserDataSource,
    selectUserCollectionsByDataSources,
    delsertDataSourceCollections
} = require('../../../services/db');

const { getAndPrepareCalculations } = require('../calculations/_helpers');

module.exports = { getAndPrepareCalculationsWithResult };

async function getAndPrepareCalculationsWithResult(userId, calculations, result) {
    const output = await getAndPrepareCalculations(calculations);
    // result processing
    for (const data of result) {
        const { parentUUID, uuid } = data;
        const parentDataSourceId = await db(USER_DATASOURCES_TABLE).where({ uuid: parentUUID }).first('id');
        const parentCollections = await selectUserCollectionsByDataSources(userId, [parentDataSourceId]);
        const dataSource = await insertUserDataSource(userId, { uuid });
        const dataSourceCollections = await delsertDataSourceCollections(dataSource.id, parentCollections);
    }
    // add result to calculations SSE output
    const calcId = calculations.find(c => c.uuid === uuid).id;
    return output.map(calc => calc.id === calcId ? { ...calc, result } : calc);
}
