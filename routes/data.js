
const http = require('http');
const https = require('https');
const querystring = require('querystring');


module.exports = {
    get,
    post,
    delete: del,
};


const secret = 'b088a178-47db-458f-b00d-465490f9517a';
const datastore = new Set();

//datastore.add({error: 'Just a random error message'});
//datastore.add({uuid: 'c099a178-47db-458f-b00d-465490f9998b', name: 'SrTiO<sub>3</sub>', type: 1});

console.log('datastore: ');
console.log(datastore);

async function get(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    const uuids = [];
    datastore.forEach(x => uuids.push(x.uuid));

    if (!uuids.length) return res.status(204).json({});

    const post_data = querystring.stringify({
        'secret': secret,
        'uuid': uuids.join(':')
    });

    const net = http; // global.secure ? https : http; FIXME import from index.js
    const proxy_req = net.request({
        host: 'localhost', // global.proxy.target
        port: 7070,
        path: 'data/list',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    }, function(subresponse){
        let result = '';
        subresponse.on('data', function(chunk){
            result += chunk;
        });
        subresponse.on('end', function(){
            try {
                result = JSON.parse(result);
                if (result.error)
                    res.sse.send([result], 'data');
                else
                    datastore.add(result);
                res.sse.send(Array.from(datastore), 'data');
            } catch (e){
                console.error("Invalid data received");
            }

        });
    }).on('error', function(err){
        console.error("Network error: " + err);
    });

    proxy_req.write(post_data);
    proxy_req.end();

    res.status(202).json({});
}

async function post(req, res) {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    const post_data = querystring.stringify({
        'secret': secret,
        'content': req.body.content
    });
    const net = http; // global.secure ? https : http; FIXME import from index.js
    const proxy_req = net.request({
        host: 'localhost', // global.proxy.target
        port: 7070,
        path: 'data/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    }, function(subresponse){
        let result = '';
        subresponse.on('data', function(chunk){
            result += chunk;
        });
        subresponse.on('end', function(){
            try {
                result = JSON.parse(result);
                if (result.error)
                    res.sse.send([result], 'data');
                else
                    datastore.add(result);
                res.sse.send(Array.from(datastore), 'data');
            } catch (e){
                console.error("Invalid data received");
            }

        });
    }).on('error', function(err){
        console.error("Network error: " + err);
    });

    proxy_req.write(post_data);
    proxy_req.end();
    res.status(202).json({});
}

async function del(req, res) {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.body.uuid) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    res.status(202).json({});

    const uuid = req.body.uuid;
    datastore.forEach(x => x.uuid === uuid ? datastore.delete(x) : x);

    res.sse.send(Array.from(datastore), 'data');
}

