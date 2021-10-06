const uuid4 = require('uuid4');

module.exports = {
    get,
    post,
    delete: del,
};

const calculations = [];

async function get(req, res) {

    if (!req.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    res.status(202).json({});

    res.sse.send(calculations, 'calculations');
}

async function post(req, res) {

    if (!req.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.body.uuid) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    res.status(202).json({});

    const uuid = req.body.uuid;

    const item = generateItem(uuid);

    calculations.push(item);

    res.sse.send(calculations, 'calculations');

    const step = Math.random() * 3000;
    const total = step * 5;

    console.log('interval step', step);
    console.log('timeout delay', total);

    const interval = setInterval(() => {
        item.progress = Math.floor(Math.random() * (99 - item.progress + 1)) + item.progress;
        res.sse.send(calculations, 'calculations');
    }, step);

    setTimeout(() => {
        clearInterval(interval);
        const i = calculations.findIndex(item => item.uuid === uuid);
        calculations.splice(i, 1);
        res.sse.send(calculations, 'calculations');
    }, total);
}

async function del(req, res) {

    if (!req.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.body.uuid) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    res.status(202).json({});

    const uuid = req.body.uuid;

    const i = calculations.findIndex(item => item.uuid === uuid);
    calculations.splice(i, 1);

    res.sse.send(calculations, 'calculations');
}

function generateItem(data) {
    return {
        uuid: uuid4(),
        progress: 0,
        data
    };
}