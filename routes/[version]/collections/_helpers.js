const {
    SHARED_COLLECTION_VISIBILITY,
    selectUserCollections,
    upsertUserCollection,
    delsertSharedCollectionUsers,
    delsertCollectionDataSources,
} = require('../../../services/db');

module.exports = {
    saveCollection,
};

async function saveCollection(user, data) {
    const { dataSources = null, users = null, ...collectionData } = data;

    const upserted = await upsertUserCollection(user.id, collectionData);

    if (!upserted.id) {
        throw new Error('Collection is not saved.');
    }

    // const selected = await selectCollections({ id: upserted.id, userId });
    const selected = await selectUserCollections(user, { collectionIds: [upserted.id] });
    const collection = selected.data[0];

    if (!collection) {
        throw new Error('Collection is not retrieved.');
    }

    if (dataSources) {
        await delsertCollectionDataSources(collection.id, dataSources);
    }

    if (users && collection.visibility === SHARED_COLLECTION_VISIBILITY) {
        await delsertSharedCollectionUsers(collection.id, users);
    }

    collection.dataSources = dataSources;
    collection.users = users;

    return collection;
}
