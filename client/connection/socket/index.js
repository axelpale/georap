// Socket.io singleton
//
// Usage:
//   var socket = require('./socket');
//   socket.start()
//
// When started and running, will propagate events to bus.
//
var bus = require('georap-bus');
var setupMessages = require('./messages');
var io = require('socket.io-client');

var socket = null;

exports.start = function () {
  // Open web socket connection
  if (socket) {
    // prevent double
    return;
  }

  // Auth token is needed to establish connection.
  // TODO how to enable sockets for public users?
  var authToken;
  try {
    authToken = georap.stores.account.getToken();
  } catch (e) {
    console.error('Cannot establish a web socket connection without token');
    return;
  }

  // Establish connection
  socket = io('/', {
    auth: {
      token: authToken,
    },
  });
  setupMessages(socket);

  // Propagate to root bus.
  // Components might already listen the bus.
  socket.on('georap_event', function (ev) {
    // Emit all location events. Allow hooking to all location events or
    // specific event type e.g. location_created.
    // This is needed for example by main menu to
    // determine when creation is successful.
    bus.emit(ev.type, ev);
    bus.emit('socket_event', ev);
  });
};

exports.stop = function () {
  if (socket) {
    socket.disconnect();
    socket.off(); // off all
    socket = null;
  }
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
