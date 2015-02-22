'use strict';

var ConnectionPool = require('./lib/connectionPool');
var app = require('express')();
var countries = require('./countries.json');

var redisConfig = {
    host: '192.168.59.103',
    port: 6379
};

var url = require('url').parse(process.env.REDISCLOUD_URL || '');

if(url.hostname !== null) {
    redisConfig = {
        host: url.hostname,
        port: url.port
    };
}

var redis = require('redis').createClient(redisConfig.port, redisConfig.host);

if(url.hostname !== null) {
    redis.auth(url.auth.split(':')[1]);
}

var clients = new ConnectionPool();

redis.subscribe('stream.score_updates');

redis.on('subscribe', function (channel, count) {
    console.log('subscribed | ' + count);
});

redis.on('message', function (channel, message) {
    // console.log('channel ' + channel + ': ' + message);

    clients.broadcast({
        data: countries.indexOf(message),
        event: null
    });
});

app.all('/subscribe/raw', function(req, res){
    return clients.provision(req, res);

    // res.writeHead(200, {
    //     'Access-Control-Allow-Origin' : '*',
    //     'Content-Type': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     'Connection': 'keep-alive'
    // });
    //
    // console.log('CONNECT:\t' + req.path + '\tby ' + req.ip);
    // req.socket.setTimeout(86400000);
    // res.write('\n');

    // var clientIP = req.socket.remoteAddress;
    // var clientPort = req.socket.remotePort;

    // console.log(clientIP + ' | ' + clientPort);

    // setInterval(function() {
    //     res.write('id: ' + (new Date()).toLocaleTimeString() + '\n');
    //     res.write('data: ' + 'zaza' + '\n\n');
    // }, 2000);
});

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function() {
    console.log('Node app is running at localhost:' + app.get('port'));
});
