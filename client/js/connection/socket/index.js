// Socket.io singleton
//
// Usage:
//   var socket = require('./socket');
//   socket.on('myevent', fn)

var socket = null;
var setupMessages = require('./messages');
var queue = {};

import(
  /* webpackPrefetch: true */
  'socket.io-client'
)
  .then(function (moduleWrap) {
    var io = moduleWrap.default;
    socket = io('/');

    setupMessages(socket);

    // Execute queued
    Object.keys(queue).forEach(function (eventName) {
      socket.on(eventName, queue[eventName]);
    });
    // Clear
    queue = {};
  })
  .catch(function (err) {
    console.log('An error occurred when loading socket.io-client');
    console.error(err);
  });

exports.on = function (eventName, handler) {
  if (socket) {
    socket.on(eventName, handler);
  } else {
    // Execute when loaded
    queue[eventName] = handler;
  }
};
