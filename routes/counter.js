module.exports = {
    get,
    post,
};

let counter = 0;

async function get(req, res) {
    setTimeout(() => {
        res.sse.send(counter, 'counter');
    }, 2000);

    res.status(202).end();
}

async function post(req, res) {
    setTimeout(() => {
        counter = req.body.counter;
        res.sse.send(counter, 'counter');
    }, 3000);

    res.status(202).end();
}