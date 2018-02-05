'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var defaultLevel = process.env.DEBUG ? 1 : 0;

var Log = function Log() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$level = _ref.level,
        level = _ref$level === undefined ? defaultLevel : _ref$level;

    var currentLevel = level;

    return {
        info: function info(msg) {
            return console.info('INFO : ' + msg);
        },
        debug: function debug(msg) {
            return currentLevel ? console.log('DEBUG : ' + msg) : undefined;
        },
        error: function error(msg) {
            return console.error('ERROR : ' + msg);
        },
        warn: function warn(msg) {
            return console.warn('WARNING : ' + msg);
        },
        level: currentLevel,
        setLevel: function setLevel(level) {
            return currentLevel = level;
        }
    };
};

exports.default = Log;