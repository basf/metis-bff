module.exports = {
    get,
};

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    return res.json(req.session.user);
}