// Socket.io singleton
//
// Usage:
//   var socket = require('./socket');
//   socket.on('myevent', fn)

var io = require('socket.io-client');

var socket = io('/');

socket.on('connect-error', function () {
  console.error('TresDB: io connect-error');
});

module.exports = socket;
