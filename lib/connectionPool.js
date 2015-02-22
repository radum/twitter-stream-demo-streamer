'use strict';

var uuid = require('node-uuid');
var _ = require('lodash');
var config = require('./config');

function ConnectionPool() {
    this._connections = {};
}

ConnectionPool.prototype.provision = function(req, res) {
    var id;
    res.writeHead(200, {
        'Access-Control-Allow-Origin' : '*',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    if (config.VERBOSE) {
        console.log('CONNECT:\t' + req.path + '\tby ' + req.ip);
    }

    req.socket.setTimeout(86400000);
    res.write('\n');

    id = this._add(req, res);

    return req.on('close', (function(_this) {
        return function() {
            _this._remove(id);
            if (config.VERBOSE) {
                return console.log('DISCONNECT:\t' + req.path + '\tby ' + req.ip);
            }
        };
    })(this));
};

ConnectionPool.prototype._add = function(req, res) {
    var conn;
    var id = uuid.v1();

    conn = new Connection(req, res);
    this._connections[id] = conn;
    if (config.VERBOSE) {
        console.log('subscribed client ' + id);
    }
    return id;
};

ConnectionPool.prototype._remove = function(id) {
    if (config.VERBOSE) {
        console.log('unsubscribed client ' + id);
    }
    return delete this._connections[id];
};

ConnectionPool.prototype.broadcast = function(arg) {
    var client;
    var results = [];

    var data = arg.data;
    var event = arg.event;

    _.forEach(this._connections, function(client) {
        results.push(client.sse_send(data, event));
    });

    return results;
};


var Connection;

Connection = (function() {
    function Connection(_at_req, _at_res) {
        this.req = _at_req;
        this.res = _at_res;
        this.createdAt = Date.now();
    }

    Connection.prototype.sse_send = function(data, event) {
        if (event == null) {
            event = null;
        }

        return this.res.write(this._sse_string(data, event));
    };

    Connection.prototype._sse_string = function(data, event) {
        if (event == null) {
            event = null;
        }

        if (event != null) {
            return "event:" + event + "\ndata:" + data + "\n\n";
        }

        return "data:" + data + "\n\n";
    };

    Connection.prototype.status = function() {
        return {
            request_path: this.req.path,
            created_at: Math.floor(this.createdAt / 1000),
            client_ip: this.req.ip,
            user_agent: this.req.get('User-Agent')
        };
    };

    return Connection;
})();

module.exports = ConnectionPool;
module.exports.Connection = Connection;
