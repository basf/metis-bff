module.exports = {
    get,
};

async function get(req, res) {
    res.json({ path: 'index' });
}