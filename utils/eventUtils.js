var exports = module.exports = {};

const eventstore = require('eventstore')
const es = require('eventstore')({type: 'redis'})
const rabbit = require('./utils/rabbitUtils')
const redis = require('redis')

es.init();
es.on('connect', function() {console.log('storage connected');});
es.on('disconnect', function() {console.log('no storage connection');});
es.useEventPublisher(publisher.publish);

const publisher = {
    
    evt: redis.createClient(),

    publish: function(evt) {
         var msg = JSON.stringify(evt, null, 4);

        console.log('\npublishing event to Redis');

        publisher.evt.publish('events', msg);

        rabbit.initChannel().then((ch) => {
        let q = 'carts';
        ch.sendToQueue(q, new Buffer(msg));
        console.log('\npublishing event to Rabbit');
        });      
    }
};

var db = redis.createClient();

exports.getEventStream = (streamID) => {
	console.log("getting event stream");

    return new Promise(function(resolve, reject) {
    	es.getEventStream(streamID, function(err, stream) {
			if(err) {
				reject(err);
			} else {
				resolve(stream);
			}
		})
    })
};

exports.addEvents = (stream, events) => {
	console.log("adding events");

	return new Promise(function(resolve, reject) {
		if(events instanceof Array) {
			stream.addEvents(events);
			resolve(stream);
		} else {
			reject('events must be passed as an array');
		}
	});
};

exports.commitEvents = (stream) => {
	console.log("commiting events");

	return new Promise(function(resolve, reject) {
	   	stream.commit(function(err, stream) {
			if(err) {
				reject(err);
			} else {
				resolve(stream);
			}
		});

	});
};

exports.asyncCommit = async (toAdd) => {
	const stream = await exports.getEventStream('streamID')
	const addEvents = await exports.addEvents(stream, toAdd)
	const commitEvents = await exports.commitEvents(stream)
	return commitEvents;
};

const dispatcher = (evt) => {
	return new Promise(function(resolve, reject) {
		es.setEventToDispatched(evt, function(err) {
			if(err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	})
};

exports.dispatchEvents = (evts, stream) => {
	console.log("dispatching events");
	return new Promise(function(resolve, reject) {

		let counter = 0;

		evts.forEach(function(evt) {
			dispatcher(es, evt).then((done) => {
				counter++;
			if(counter === evts.length) {
				resolve(stream)
			}

			}).catch((e) => {
				reject(e);
			})
		})
	})
};