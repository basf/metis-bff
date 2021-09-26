
const http = require('http');
const https = require('https');
const querystring = require('querystring');

const config = require('./../config');


module.exports = {
    get,
    post,
    delete: del,
};

const secret = 'b088a178-47db-458f-b00d-465490f9517a';

async function get(req, res) {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.session.datastore) req.session.datastore = [];

    const uuids = [];
    req.session.datastore.forEach(item => uuids.push(item.uuid));

    if (!uuids.length) return res.status(204).json({});

    const post_data = querystring.stringify({ 'secret': secret, 'uuid': uuids.join(':') });

    const dev = req.app.get('development mode'),
        proxy = config.target[ dev ? 'dev': 'prod' ];

    const net = dev ? http : https;
    const proxy_req = net.request({
        host: proxy.host,
        port: proxy.port,
        path: proxy.path + '/data/listing',
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
                    result.forEach(item => req.session.datastore.push(item))

                req.session.datastore = req.session.datastore.filter((v, i, self) => self.findIndex(t => (t.uuid === v.uuid)) === i);
                res.sse.send(req.session.datastore, 'data');
                req.session.save();
            } catch (e){
                console.error("Invalid data received: " + JSON.stringify(result));
            }
        });
    }).on('error', function(err){
        console.error("Network error: " + err);
    });
    proxy_req.write(post_data);
    proxy_req.end();
    res.status(202).json({});
    console.log(req.session.datastore);
}

async function post(req, res) {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.session.datastore) req.session.datastore = [];

    const post_data = querystring.stringify({ 'secret': secret, 'content': req.body.content });

    const dev = req.app.get('development mode'),
        proxy = config.target[ dev ? 'dev': 'prod' ];

    const net = dev ? http : https;
    const proxy_req = net.request({
        host: proxy.host,
        port: proxy.port,
        path: proxy.path + '/data/create',
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
                    req.session.datastore.push(result);

                req.session.datastore = req.session.datastore.filter((v, i, self) => self.findIndex(t => (t.uuid === v.uuid)) === i);
                res.sse.send(req.session.datastore, 'data');
                req.session.save();
            } catch (e){
                console.error("Invalid data received: " + JSON.stringify(result));
            }
        });
    }).on('error', function(err){
        console.error("Network error: " + err);
    });
    proxy_req.write(post_data);
    proxy_req.end();
    res.status(202).json({});
    console.log(req.session.datastore);
}

async function del(req, res) {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Need to authorize first' });
    }

    if (!req.session.datastore) req.session.datastore = [];

    if (!req.body.uuid) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const post_data = querystring.stringify({ 'secret': secret, 'uuid': req.body.uuid });

    const dev = req.app.get('development mode'),
        proxy = config.target[ dev ? 'dev': 'prod' ];

    const net = dev ? http : https;
    const proxy_req = net.request({
        host: proxy.host,
        port: proxy.port,
        path: proxy.path + '/data/delete',
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

            } catch (e){
                console.error("Invalid data received: " + JSON.stringify(result));
            }
        });
    }).on('error', function(err){
        console.error("Network error: " + err);
    });
    proxy_req.write(post_data);
    proxy_req.end();
    res.status(202).json({});

    let filtered = [];
    req.session.datastore.forEach(function(item){
        if (item.uuid != req.body.uuid)
            filtered.push(item);
    });
    req.session.datastore = filtered;

    res.sse.send(req.session.datastore, 'data');
    req.session.save();
    console.log(req.session.datastore);
}
