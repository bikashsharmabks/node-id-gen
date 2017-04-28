# node-id-gen
node-id-gen -  A sequence id generation services using nodejs + redis + lua


## Installation ##
$ npm install --save node-id-gen ⏎

## Usage ##
```js
var nodeIdGen = require('node-id-gen');
var redisClient = require('redis').createClient();

nodeIdGen.init(redisClient);

//create a auto increment sequence for userId
nodeIdGen.createSequence({'name': 'userId'});

//next method which is promise and return the sequence
nodeIdGen.next('userId').then(function(seq) {
	console.log(seq);  // 1
}).catch(function(err) {
	console.log(err);
});
```

## Options ##

We have few options while init nodeIdGen
```js
nodeIdGen.init(redisClient, {
	'retryTimes': 10,  //default 100
	'retryDelay': 500  //default 500 (in milliseconds)
});
```
Options while creating a new sequence
```js
nodeIdGen.createSequence({
	'name': 'userId',
	'startSequence': 1000, //default its 0 which 1 if call next() sequence
	'maxSequence': 999999 //default its 999999999 after which next() method shall throw error
});
```


## Author ##
Writen by Bikash Kumar Sharma - [Site](http://bikashsharma.me)

## License ##
Copyright (c) 2017 Bikash Kumar Sharma
