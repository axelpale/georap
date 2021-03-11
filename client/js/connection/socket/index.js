// Socket.io singleton
//
// Usage:
//   var socket = require('./socket');
//   socket.on('myevent', fn)

var socket = null;
var setupMessages = require('./messages');

var io = require('socket.io-client');
socket = io('/');

console.log('socket = io(/) called');
setupMessages(socket);

exports.on = function (eventName, handler) {
  socket.on(eventName, handler);
};

// An attempt to dynamically load socket.io-client. Everything
// seemed to work, queue seemed to work. Somehow it still did not work.
// Events were sent from server successfully. No problem.
// Yet, none of the events were received on the client.
// Back to bloat-bundle, yak.
//
// Maybe server needs some something immediate. I dont know.
//

// import(
//   /* webpackChunkName: "socket-io" */
//   'socket.io-client'
// )
//   .then(function (moduleWrap) {
//     var io = moduleWrap.default;
//     socket = io('/');
//
//     console.log('socket = io(/) called');
//     setupMessages(socket);
//
//     // Execute queued
//     Object.keys(queue).forEach(function (eventName) {
//       console.log('queue', eventName);
//       socket.on(eventName, queue[eventName]);
//     });
//     // Clear
//     queue = {};
//   })
//   .catch(function (err) {
//     console.log('An error occurred when loading socket.io-client');
//     console.error(err);
//   });

// exports.on = function (eventName, handler) {
//   console.log('on. if socket');
//   if (socket) {
//     console.log('socket set, socket.on', eventName);
//     socket.on(eventName, handler);
//   } else {
//     // Execute when loaded
//     queue[eventName] = handler;
//   }
// };
