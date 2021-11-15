// Singleton wrapper around socket.io

const socketio = require('socket.io');

let io = null;

exports.init = function (server) {
  // Parameters:
  //   server
  //     created with http.createServer(app), where app = express()
  if (io === null) {
    io = socketio(server, {
      pingTimeout: 60000,
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
