const { hasAuthBearerHeader } = require('./apiToken');

module.exports = function (req, res, next) {
    function createFilter(data, event, _id) {
        let newData = null;
        function filterByUserId(userId) {
            newData = { ...data };
            return req.user && req.user.id === userId;
        }

        function filterSharedCollections(userId) {
            newData = null;
            if (event !== 'collections') {
                return false;
            }

            const sharedCollections = data.data?.filter(({ visibility, users }) => {
                return visibility === 'shared' && users?.includes(userId);
            });

            if (sharedCollections.length) {
                newData = { ...data, data: sharedCollections, total: sharedCollections.length };
                return true;
            }
            return false;
        }

        let userId;
        return {
            user({ session, user }) {
                userId = session?.passport?.user || user?.id;
                return filterByUserId(userId) || filterSharedCollections(userId);
            },
            data: {
                toJSON() {
                    return newData;
                },
            },
        };
    }

    res.sse.sendTo = function (data, event, id) {
        const filters = createFilter(data, event, id);
        if (hasAuthBearerHeader(req)) {
            this.send(filters.user, filters.data, event, id);
        } else {
            req.session.save(() => {
                this.send(filters.user, filters.data, event, id);
            });
        }
    };

    return next();
};
