// Socket.io singleton

var io = require('socket.io-client');

var socket = io('/');

socket.on('connect-error', function () {
  console.error('TresDB: io connect-error');
});

module.exports = socket;
