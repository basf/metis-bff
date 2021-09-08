module.exports = {
    get,
};

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    if (!req.params.uuid) {
        return res.status(400).json({ message: 'Empty or invalid content' });
    }

    const uuid = req.params.uuid;
    const progress = Math.floor(Math.random() * (100 + 1)) + 0;

    return res.json({
        uuid,
        progress, 
    });
}