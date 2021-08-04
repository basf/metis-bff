const uuid4 = require('uuid4');

module.exports = {
    get,
    post,
};

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    const listing = Array.apply(null, Array(Math.floor(Math.random() * 3) + 0)).map(() => ({
        uuid: uuid4(),
        type: Math.floor(Math.random() * 3) + 1,
        name: 'C2H5OH'
    }));

    return res.json(listing);
}

async function post(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    if (!req.body.uuid) {
        return res.status(400).json({ message: 'Empty or invalid content' });
    }

    const jobId = req.body.uuid;

    setTimeout(() => {
        res.sse.send({ jobId }, 'calculation:completed');
    }, 1000);

    return res.status(202).json({ jobId });
}