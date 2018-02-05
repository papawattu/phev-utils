"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var PING_SEND_CMD = exports.PING_SEND_CMD = 0xf9;
var PING_RESP_CMD = exports.PING_RESP_CMD = 0x9f;
var START_SEND = exports.START_SEND = 0xf2;
var START_RESP = exports.START_RESP = 0x2f;
var SEND_CMD = exports.SEND_CMD = 0xf6;
var RESP_CMD = exports.RESP_CMD = 0x6f;
var DEFAULT_LENGTH = exports.DEFAULT_LENGTH = 4;
var REQUEST_TYPE = exports.REQUEST_TYPE = 0;
var RESPONSE_TYPE = exports.RESPONSE_TYPE = 1;
var EMPTY_DATA = exports.EMPTY_DATA = Buffer.from([0]);