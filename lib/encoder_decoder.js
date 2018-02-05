'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildMsg = exports.validate = exports.toMessageArray = exports.popMessage = exports.findCommand = exports.extract = exports.decode = exports.encode = exports.generateChecksum = undefined;

var _ = require('./');

var allowedCommands = [0xf2, 0x2f, 0xf6, 0x6f, 0xf9, 0x9f];

var popMessage = function popMessage(messages, callback) {
    var message = extract(messages);
    callback(message);
    var idx = findCommand(messages);

    if (idx > -1) {
        if (messages.length - message.length) {
            var remaining = Buffer.alloc(messages.length - message.length);
            messages.copy(remaining, 0, message.length + idx);
            popMessage(remaining, callback);
        }
    } else {
        throw Error('Command not found in message');
    }
};

var findCommand = function findCommand(messages) {
    var idx = 0;
    var command = messages[0];
    while (allowedCommands.indexOf(command) < 0 && idx < messages.length) {
        idx++;
        command = messages[idx];
    }
    if (idx == messages.length) {
        return -1;
    }
    return idx;
};
var extract = function extract(messages) {
    var idx = findCommand(messages);
    var command = messages[0];

    if (idx > -1) {
        var length = messages[1 + idx] + 2 || 0;

        if (length > messages.length - idx) {
            throw Error('Message not complete ' + messages.toString('hex') + ' index ' + idx);
        }
        var chunk = Buffer.alloc(length);

        messages.copy(chunk, 0, idx, length + idx);
        return chunk;
    } else {
        throw Error('Message is full of rubbish ' + messages.toString('hex') + ' length ' + idx);
    }
};

var decode = function decode(message) {
    var command = message[0];
    var length = message[1];
    var type = message[2];
    var register = message[3];
    var data = message.slice(4, message.length - 1);
    var checksum = message[message.length - 1];

    return { command: command, length: length, type: type, register: register, data: data, checksum: checksum };
};
var encode = function encode(command) {
    if (command === null) return null;
    var message = Buffer.alloc(command.data.length + 5);
    message[0] = command.command;
    message[1] = command.data.length + 3;
    message[2] = command.type;
    message[3] = command.register;
    var d = Buffer.from(command.data);
    d.copy(message, 4);
    message[message.length - 1] = generateChecksum(message);
    return message;
};

var generateChecksum = function generateChecksum(data) {
    return data.reduce(function (y, x, i) {
        return i < data.length - 1 ? y + x & 0xff : y;
    }, 0);
};

var toMessageArray = function toMessageArray(messages, current) {
    var arr = current || [];

    return messages.length > 0 ? toMessageArray(Buffer.from(messages.slice(arr[arr.push(extract(messages)) - 1].length, messages.length)), arr) : arr || [];
};

var validate = function validate(message) {
    if (findCommand(message) < 0) {
        _.log.error('Cannot find command in message :' + JSON.stringify(message));
        return false;
    }
    if (message.length !== message[1] + 2) {
        _.log.error('Message length incorrect :' + JSON.stringify(message));
        return false;
    }
    if (generateChecksum(Buffer.from(message, 0, message.length - 2)) !== message[message.length - 1]) {
        _.log.error('Checksum incorrect :' + JSON.stringify(message));
        return false;
    }
    return true;
};

var buildMsg = function buildMsg(command) {
    return function (type) {
        return function (register) {
            return function (length) {
                return function (data) {
                    return {
                        command: command,
                        type: type,
                        register: register,
                        length: length,
                        data: data
                    };
                };
            };
        };
    };
};

exports.generateChecksum = generateChecksum;
exports.encode = encode;
exports.decode = decode;
exports.extract = extract;
exports.findCommand = findCommand;
exports.popMessage = popMessage;
exports.toMessageArray = toMessageArray;
exports.validate = validate;
exports.buildMsg = buildMsg;