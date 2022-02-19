// Singleton wrapper around socket.io

const socketio = require('socket.io');
const config = require('georap-config');
const isAble = require('georap-able').isAble;
const jwt = require('jsonwebtoken');

let io = null;

exports.init = function (server) {
  // Parameters:
  //   server
  //     created with http.createServer(app), where app = express()
  if (io === null) {
    io = socketio(server, {
      pingTimeout: 60000,
    });

    // Check that user is authenticated at connection.
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      jwt.verify(token, config.secret, (errj, decoded) => {
        if (errj) {
          return next(errj);
        }
        if (!isAble(decoded, 'socket-events')) {
          return next(new Error('forbidden'));
        }
        // Success
        socket.user = decoded;
        return next();
      });
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
