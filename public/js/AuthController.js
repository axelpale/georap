var Emitter = require('component-emitter');

var TOKEN_KEY = 'tresdb-session-token';

module.exports = function AuthController(socket, storage) {
  // Parameters:
  //   socket
  //   storage
  // Emits:
  //   login
  //   logout
  Emitter(this);
  var self = this;

  this.login = function (email, password, callback) {
    // Parameters:
    //   email
    //   password
    //   callback
    //     function (err)
    // Emits:
    //   login
    //     On successful login.
    var payload;

    if (typeof callback === 'undefined') { callback = function () {}; }

    payload = { email: email, password: password };
    socket.emit('loginRequest', payload, function (response) {
      if (response.hasOwnProperty('token')) {
        // Success
        storage.setItem(TOKEN_KEY, response.token);
        self.emit('login');
        callback(null);
      } else if (response.hasOwnProperty('error')) {
        // Failure
        callback(new Error(response.error));
      } else {
        // Error
        console.error('Invalid response to loginRequest');
      }
    });
  };

  this.logout = function (callback) {
    // Parameters:
    //   callback
    //     function (err), if successful, err === null
    // Emits:
    //   logout
    //     On successful logout

    // TODO ask server to invalidate the token.

    storage.removeItem(TOKEN_KEY);
    self.emit('logout');

    if (typeof callback !== 'undefined') {
      callback(null);
    }
  };

  this.hasToken = function () {
    // True if user is authenticated.

    if (storage.getItem(TOKEN_KEY) !== null) {
      return true;
    }
    return false;
  };

  this.getToken = function () {
    return storage.getItem(TOKEN_KEY);
  };
}
