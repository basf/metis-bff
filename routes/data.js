const uuid4 = require('uuid4');

module.exports = {
    get,
    post,
    put,
};

const data = Array.apply(null, Array(Math.floor(Math.random() * 5) + 0)).map((_, i) => generateItem(`Data ${i}`));
console.log('data', data);
async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }
    res.status(202).json({});


    res.sse.send(data, 'data');
}

async function post(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    data.push(generateItem(`Data ${data.length}`, req.body.content));

    res.sse.send(data, 'data');

    res.status(202).json({});
}

async function put(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    if (!req.body.uuid) {
        return res.status(401).json({ message: 'Need to authorization first' });
    }

    res.status(202).json({});

    const uuid = req.body.uuid;

    const i = data.findIndex(item => item.uuid === uuid);
    data.splice(i, 1);
    
    res.sse.send(data, 'data'); 
}

function generateItem(name, content = '') {
    return {
        uuid: uuid4(),
        type: Math.floor(Math.random() * 2) + 1,
        name,
        content
    };
}
