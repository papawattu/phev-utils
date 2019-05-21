'use strict';

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _encoder_decoder = require('./encoder_decoder');

var _messageConstants = require('./message-constants');

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sendRaw = function sendRaw(socket, message) {
    console.log('> ' + message.toString('hex'));
    socket.write(message);
};

var send = function send(socket, message) {
    return sendRaw(socket, (0, _encoder_decoder.encode)(message));
};

var swapNibble = function swapNibble(byte) {
    if (byte == 0xf2) return 0x2f;
    if (byte == 0xf6) return 0x6f;
    if (byte == 0xf9) return 0x9f;
    return 0;
};
var responder = function responder(data, socket) {
    (0, _encoder_decoder.popMessage)(data, function (message) {
        var cmd = (0, _encoder_decoder.decode)(message);
        var response = {
            command: swapNibble(cmd.command),
            length: _messageConstants.DEFAULT_LENGTH,
            type: _messageConstants.RESPONSE_TYPE,
            register: cmd.register,
            data: _messageConstants.EMPTY_DATA
        };

        send(socket, response);
    });
};
var startSocket = function startSocket() {
    var server = _net2.default.createServer(function (socket) {
        console.log('Connected');
        responder2(socket);

        socket.on('error', function (err) {
            return console.log('Error ' + err);
        });
        socket.on('end', function () {
            return console.log('Disconnected');
        });
        socket.on('data', function (data) {
            console.log('< ' + data.toString('hex'));
            responder(data, socket);
        });
    });

    server.on('error', function (err) {
        return console.log('Error ' + err);
    });
    server.listen(8080, function () {
        return console.log('Server listening on port 8080');
    });
};

var responder2 = function responder2(socket) {
    var i = 0;
    var data = fs.readFileSync('resources/data.txt');
    var str = data.toString();

    var arr = str.split('\n');

    var res = arr.filter(function (x) {
        return x.charAt(0) == ' ';
    }).map(function (x) {
        return x.substring(14, 62).split(' ').filter(function (y) {
            return y.length == 2;
        }).reduce(function (buf, x, idx) {
            return Buffer.concat([buf, Buffer.from(x, 'hex')]);
        }, Buffer.from([]));
    });

    setInterval(function () {
        return sendRaw(socket, res[i < res.length ? i++ : process.exit()]);
    }, 200);
};

startSocket();