
function is_valid_uuid(uuid) {
    uuid = '' + uuid;
    uuid = uuid.match(
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    );
    return uuid !== null;
}

module.exports = {
    is_valid_uuid,
};
