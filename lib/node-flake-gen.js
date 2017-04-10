"use strict";

var LuaScriptRunner = require('./lua-script-runner');
var lsr;

var LUA_SCRIPT_NAME = 'flake-gen';
var LUA_SCRIPT_RESOURCE_PATH = "./lib/flake-gen.lua";
var DEFAULT_MAX_ATTEMPTS = 5;

// We specify an custom epoch that we will use to fit our timestamps within the bounds of the 41 bits we have
// available. This gives us a range of ~69 years within which we can generate IDs.
//
// This timestamp must be in milliseconds.
var DEFAULT_CUSTOM_EPOCH = 1455788600316;

var LOGICAL_SHARD_ID_BITS = 10;
var SEQUENCE_BITS = 12;

var TIMESTAMP_SHIFT = SEQUENCE_BITS + LOGICAL_SHARD_ID_BITS;
var LOGICAL_SHARD_ID_SHIFT = SEQUENCE_BITS;

// These three bitopped constants are also used as bit masks for the maximum value of the data they represent.
var MAX_SEQUENCE = ~(-1 << SEQUENCE_BITS);
var MAX_LOGICAL_SHARD_ID = ~(-1 << LOGICAL_SHARD_ID_BITS);
var MIN_LOGICAL_SHARD_ID = 1;

var MAX_BATCH_SIZE = MAX_SEQUENCE + 1;

var ONE_SECOND_IN_MILLIS = 1000;
var ONE_MILLI_IN_MICRO_SECS = 1000;

var NodeFlakeGen = module.exports = {
	init: init,
	generate: generate
}

function init(redisClient) {
	lsr = new LuaScriptRunner(redisClient);
	lsr.loadFromFile(LUA_SCRIPT_NAME, LUA_SCRIPT_RESOURCE_PATH);
}

function generate(cb) {

	var keys = [MAX_SEQUENCE, 1];

	lsr.run(LUA_SCRIPT_NAME, keys, [], cb);
}