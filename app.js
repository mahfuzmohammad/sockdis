var express = require('express'),
	redis = require('redis');

var app = express(),
	redis_client = redis.createClient({
		host: '172.20.50.35',
		port: 6379,
		detect_buffers: true
	});

var tls = require('tls');
var fs = require('fs');
var ws = require("nodejs-websocket");

var options = {
	secure : true,
	key  : fs.readFileSync('private.key'),
	cert : fs.readFileSync('public.cert')
};

var server = ws.createServer(options, function (conn) {
	console.log("New connection.");

	redis_client.on("subscribe", function (channel, count) {
		console.log("Subscribed " + channel);
		// redis_client.publish(channel, "This is my message");
	});

	redis_client.on("message", function (channel, message) {
		console.log(message);

		if(conn.readyState === conn.OPEN) {
			conn.sendText(message);
		} else {
			conn.close();
		}
	});

	conn.on("text", function (str) {
		console.log("Received "+str);

		var msg = JSON.parse(str);
		redis_client.subscribe(msg[1]);
	});

	conn.on("close", function (code, reason) {
		console.log("Connection closed.");
	});
}).listen(8000);

app.get('/', function (req, res) {
	res.send( "Hello" );
});

app.listen(3000, function () {
	console.log('listening on port 3000!');
});