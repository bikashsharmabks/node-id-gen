"use strict";

var LuaScriptRunner = require('./lua-script-runner'),
	debug = require('debug')('node-id-gen');

var lsr,
	sequences = [],
	LUA_SCRIPT_NAME = 'sequence-gen',
	LUA_SCRIPT_RESOURCE_PATH = "./lib/id-seq-gen.lua",
	DEFAULT_START_SEQUENCE = 0, // intentional not done 1 to start 
	DEFAULT_MAX_SEQUENCE = 999999999,
	SEQUENCE_INDEX = 0,
	ERROR_INDEX = 1

var NodeIdGen = module.exports = {
	init: init,
	createSequence: createSequence,
	next: next,
	options: {
		'retryTimes': 100,
		'retryDelay': 50
	}
}

function init(redisClient, opt) {
	if (!lsr) {
		lsr = new LuaScriptRunner(redisClient);
		lsr.loadFromFile(LUA_SCRIPT_NAME, LUA_SCRIPT_RESOURCE_PATH);
	}

	if (opt) {
		NodeIdGen.options.retryTimes = opt.retryTimes ? opt.retryTimes : NodeIdGen.options.retryTimes;
		NodeIdGen.options.retryDelay = opt.retryDelay ? opt.retryDelay : NodeIdGen.options.retryDelay;
	}
}

function createSequence(opt) {
	sequences.push({
		'name': opt.name,
		'startSequence': opt.startSequence ? opt.startSequence : DEFAULT_START_SEQUENCE,
		'maxSequence': opt.maxSequence ? opt.maxSequence : DEFAULT_MAX_SEQUENCE,
		'lockKey': opt.name + '_lock',
		'sequenceKey': opt.name + '_key'
	});
}

function next(name) {
	return new Promise(function(resolve, reject) {

		var sequence = sequences.find((function(seq) {
			return seq.name == name;
		}));

		if (!sequence) {
			return reject(new Error('Sequence ' + name + ' not found'));
		}

		runRequest(sequence, function(err, sequence) {
			if (err) {
				return reject(err);
			}
			debug('Generated Sequence:' + sequence);
			return resolve(sequence);
		});
	});
}

function runRequest(sequence, callback) {
	var cntr = 0;

	var keys = [sequence.lockKey,
			sequence.sequenceKey,
			sequence.startSequence,
			sequence.maxSequence
		],
		args = [];

	function run() {
		// try your async operation
		lsr.run(LUA_SCRIPT_NAME, keys, args, function(err, out) {
			++cntr;

			if (err) {
				callback(err);
			} else {
				// success, send the data out
				var generatedSequence = out[SEQUENCE_INDEX];
				var error = out[ERROR_INDEX];

				if (generatedSequence == -1) {
					debug('Lock on sequence name: ' + sequence.name + ' Retrying lock again attempt: ' + cntr);

					if (cntr >= NodeFlakeGen.options.retryTimes) {
						// if it fails too many times, just send the error out
						callback('Unable to apply Lock on sequence name: ' + sequence.name);
					} else {
						// try again after a delay
						setTimeout(run, NodeFlakeGen.options.retryDelay);
					}

				} else {
					callback(null, generatedSequence);
				}
			}
		});
	}
	// start our first request to make a sequence
	run();
}