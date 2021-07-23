module.exports = {
    get,
};

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    return res.json(req.session.user);
}