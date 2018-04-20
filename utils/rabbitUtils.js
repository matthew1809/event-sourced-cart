const amqp = require('amqplib');
var exports = module.exports = {};

let channel;

exports.initChannel = async () => {

	if (channel) {
      return channel
    }

	let q = 'hello';
	const connection = await amqp.connect('amqp://localhost');
	channel = await connection.createChannel();
	const queue = await channel.assertQueue(q, {durable: false});
	return channel;
};