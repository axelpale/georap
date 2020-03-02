// Socket.io singleton
//
// Usage:
//   var socket = require('./socket');
//   socket.on('myevent', fn)

var io = require('socket.io-client');

var socket = io('/');

socket.on('connect', function () {
  console.log('Socket: connect');
});
socket.on('connect_error', function () {
  console.log('Socket: connect_error');
});
socket.on('connect_timeout', function () {
  console.log('Socket: connect_timeout');
});
socket.on('error', function () {
  console.log('Socket: error');
});
socket.on('disconnect', function () {
  console.log('Socket: disconnect');
});
socket.on('reconnect', function () {
  console.log('Socket: reconnect');
});
socket.on('reconnect_attempt', function () {
  console.log('Socket: reconnect_attempt');
});
socket.on('reconnecting', function () {
  console.log('Socket: reconnecting');
});
socket.on('reconnect_error', function () {
  console.log('Socket: reconnect_error');
});
socket.on('reconnect_failed', function () {
  console.log('Socket: reconnect_failed');
});

module.exports = socket;
