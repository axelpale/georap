// Singleton wrapper around socket.io

var socketio = require('socket.io');
var hostname = require('./hostname');

var io = null;

exports.init = function (server) {
  // Parameters:
  //   server
  //     created with http.createServer(app), where app = express()
  if (io === null) {
    io = socketio(server);

    // Middleware to find hostname.
    // Domain name is required by some handlers, for example
    // when a link is sent via email. It does not matter if
    // the connection is transported via polling or websockets,
    // the host stays the same.
    io.use(function (socket, next) {
      if (socket.request.headers.host) {
        hostname.init(socket.request.headers.host);
      }
      return next();
    });
  }
};

exports.get = function () {
  // Return Socket.io server/namespace instance

  if (io !== null) {
    return io;
  }

  throw new Error('io.init must be called before io.get');
};
