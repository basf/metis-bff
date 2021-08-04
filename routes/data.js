const uuid4 = require('uuid4');

module.exports = {
    get,
    post,
    patch,
};

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    const listing = Array.apply(null, Array(Math.floor(Math.random() * 3) + 0)).map(() => ({
        uuid: uuid4(),
        type: Math.floor(Math.random() * 2) + 1,
        name: 'Ba2Li3Sc6O9'
    }));

    return res.json(listing);
}

async function post(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    if (!req.body.content) {
        return res.status(400).json({ message: 'Empty or invalid content' });
    }

    return res.json({
        uuid: uuid4(),
        type: Math.floor(Math.random() * 2) + 1,
        name: 'SrTiO3'
    });
}

async function patch(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    if (!req.body.uuid) {
        return res.status(400).json({ message: 'Empty or invalid content' });
    }

    return res.json({});
}
