'use strict';

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _encoder_decoder = require('./encoder_decoder');

var _messageConstants = require('./message-constants');

var _ = require('.');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//const sendFullCommand = (register, data) => send(buildMsg(RESP_CMD)(REQUEST_TYPE)(register)(DEFAULT_LENGTH + data.length - 1)(data))

//const sendDateSync = date => sendFullCommand(codes.KO_WF_DATE_INFO_SYNC_EVR, Buffer.from([date.getFullYear() - 2000, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 1]))

var startDateSync = function startDateSync() {
    _.log.debug('Started Date sync');
    return setInterval(function () {
        var date = new Date();
        _.log.debug('Send date sync ' + date.toJSON());
        sendDateSync(date);
    }, 30000);
};
/*
messaging.start()
messaging.registerHandler(message => {
    const messages = toMessageArray(message).map(x => decode(x)).filter(x => x.command === 0xf6 && x.type === 0)

    const response = messages.map(message => {

        message.command = 0x6f
        message.type = 1
        message.data = Buffer.from([0])
        send(message)
    })
})
*/
var swapNibble = function swapNibble(byte) {
    if (byte == 0xf2) return 0x2f;
    if (byte == 0xf6) return 0x6f;
    if (byte == 0xf9) return 0x9f;
    return 0;
};
var responder = function responder(data, socket) {
    EncoderDecoder.popMessage(doubleMessage, function (message) {
        var cmd = EncoderDecoder.decode(message);
        var response = {
            command: swapNibble(cmd.command),
            length: _messageConstants.DEFAULT_LENGTH,
            type: _messageConstants.RESPONSE_TYPE,
            register: cmd.register,
            data: _messageConstants.EMPTY_DATA
        };

        socket.write(EncoderDecoder.encode(response));
    });
};
var startSocket = function startSocket() {
    var server = _net2.default.createServer(function (socket) {
        console.log('Connected');
        socket.on('end', function () {
            return console.log('Disconnected');
        });
        socket.on('data', function (data) {
            console.log('Data ' + JSON.stringify((0, _encoder_decoder.decode)(data)));
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

//startDateSync()

startSocket();