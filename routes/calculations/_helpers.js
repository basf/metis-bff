const { insertUserCalculation, deleteUserCalculation, selectDataSourceByUserId } = require('../../services/db');
const { runCalculation, getCalculations, cancelCalculation } = require('../../services/backend');

module.exports = {
    deleteAndClearCalculation,
    getAndPrepareCalculations,
    runAndSaveCalculation,
};

async function runAndSaveCalculation(userId, dataId, updateHook) {

    const datasource = await selectDataSourceByUserId(userId, { id: dataId });

    if (!datasource.uuid) {
        throw 'Data Source UUID is not available';
    }

    const { data = {} } = await runCalculation(datasource.uuid, updateHook);

    if (!data.uuid) {
        throw 'Calculation UUID is not available';
    }

    return insertUserCalculation(userId, { uuid: data.uuid });
}

async function getAndPrepareCalculations(calculations = []) {

    const { uuids, calc } = calculations.reduce((acc, { uuid, ...other }) => {
        acc.uuids.push(uuid);
        acc.calc.push(other);
        return acc;
    }, { uuids: [], calc: [] });

    if (!uuids.length) return [];

    const { data = [] } = await getCalculations(uuids);

    return data.reduce((acc, { uuid, ...data }) => {
        const i = uuids.indexOf(uuid);
        acc.push(Object.assign(data, calc[i]));
        return acc;
    }, []);
}

async function deleteAndClearCalculation(userId, id) {
    const { uuid } = await deleteUserCalculation(userId, id);
    cancelCalculation(uuid);
    return uuid;
}