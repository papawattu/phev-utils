'use strict';

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _mqtt = require('mqtt');

var _mqtt2 = _interopRequireDefault(_mqtt);

var _phevMessaging = require('phev-messaging');

var _encoder_decoder = require('./encoder_decoder');

var _messageConstants = require('./message-constants');

var _ = require('.');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mqttUri = process.env.MQTT_URI || 'mqtt://secure.wattu.com';

var messaging = (0, _phevMessaging.MessagingClient)({ messaging: (0, _phevMessaging.MqttClient)({ mqtt: _mqtt2.default, mqttUri: mqttUri, topicName: 'phev/receive', subscriptionName: 'phev/send' }) });

var send = function send(message) {
    messaging.publish((0, _encoder_decoder.encode)(message));
};

var sendFullCommand = function sendFullCommand(register, data) {
    return send((0, _encoder_decoder.buildMsg)(_messageConstants.RESP_CMD)(_messageConstants.REQUEST_TYPE)(register)(_messageConstants.DEFAULT_LENGTH + data.length - 1)(data));
};

var sendDateSync = function sendDateSync(date) {
    return sendFullCommand(_.codes.KO_WF_DATE_INFO_SYNC_EVR, Buffer.from([date.getFullYear() - 2000, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 1]));
};

var startDateSync = function startDateSync() {
    _.log.debug('Started Date sync');
    return setInterval(function () {
        var date = new Date();
        _.log.debug('Send date sync ' + date.toJSON());
        sendDateSync(date);
    }, 30000);
};

messaging.start();
messaging.registerHandler(function (message) {
    var messages = (0, _encoder_decoder.toMessageArray)(message).map(function (x) {
        return (0, _encoder_decoder.decode)(x);
    }).filter(function (x) {
        return x.command === 0xf6 && x.type === 0;
    });

    var response = messages.map(function (message) {

        message.command = 0x6f;
        message.type = 1;
        message.data = Buffer.from([0]);
        send(message);
    });
});

var startSocket = function startSocket() {
    var server = _net2.default.createServer(function (socket) {
        console.log('Connected');
        socket.on('end', function () {
            return console.log('Disconnected');
        });
        socket.on('data', function (data) {
            return console.log('Data ' + JSON.stringify((0, _encoder_decoder.decode)(data)));
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