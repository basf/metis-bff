const {
    USER_COLLECTONS_TABLE,
    SHARED_COLLECTION_VISIBILITY,
    selectCollections,
    upsertUserCollection,
    delsertSharedCollectionUsers,
    delsertCollectionDataSources,
} = require('../../../services/db');

module.exports = {
    saveCollection,
};

async function saveCollection(userId, data) {
    const { dataSources = null, users = null, ...collectionData } = data;

    const upserted = await upsertUserCollection(userId, collectionData);

    if (!upserted.id) {
        throw new Error('Collection is not saved.');
    }

    const selected = await selectCollections({ id: upserted.id, userId });
    const collection = selected[0];

    if (!collection) {
        throw new Error('Collection is not retrieved.');
    }

    if (dataSources) {
        await delsertCollectionDataSources(collection.id, dataSources);
    }

    if (users) {
        await delsertSharedCollectionUsers(collection.id, users);
    }

    collection.dataSources = dataSources;
    collection.users = users;

    return collection;
}
