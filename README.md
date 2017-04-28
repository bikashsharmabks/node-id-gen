# node-id-gen
node-id-gen -  A sequence id generation services using nodejs + redis + lua


Installing node-id-gen npm module

```
> npm install node-id-gen

```

```
var nodeIdGen = require('node-id-gen');
var redisClient = require('redis').createClient();

nodeIdGen.init(redisClient);

//create a auto increment sequence for userId
nodeIdGen.createSequence({'name': 'userId'});

nodeIdGen.next('userId').then(function(seq) {
	console.log(seq);  // 1
}).catch(function(err) {
	console.log(err);
});
```
