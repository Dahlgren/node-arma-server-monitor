var events = require('events');
var net = require('net');

var parser = require('./buffer');

var heartbeat = '\0\0\0\0';

var ASM = function (host, port, interval) {
  this.host = host || 'localhost';
  this.port = port || 24000;
  this.interval = interval || 1000;
};

// Inherit EventEmitter
ASM.prototype.__proto__ = events.EventEmitter.prototype;

ASM.prototype.connect = function () {
  var self = this;
  self.client = net.connect({host: self.host, port: self.port}, function() {
    // Connected, start sending heartbeats to receive new data
    self.startHeartbeat();

    self.emit('connected');
  }).on('data', function(data) {
    // Parse c struct to js obj
    var vars = parser(data);

    // Emit new data
    self.emit('stats', vars);
  }).on('end', function() {
    self.emit('disconnected');
  });
};

// Cleanup heartbeating and close socket on disconnect
ASM.prototype.disconnect = function () {
  this.stopHeartbeat();
  this.client.end();
};

// Send heartbeat to server to receive new data on given interval
ASM.prototype.startHeartbeat = function () {
  var self = this;

  self.client.write(heartbeat);
  self.intervalId = setInterval(function () {
    self.client.write(heartbeat);
  }, self.interval);
};

// Remove interval event
ASM.prototype.stopHeartbeat = function () {
  clearInterval(this.intervalId);
};

module.exports = ASM;
