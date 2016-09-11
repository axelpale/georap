var Emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');

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
    //     email address
    //   password
    //   callback
    //     function (err)
    // Emits:
    //   login
    //     On successful login.
    var payload;

    if (typeof callback === 'undefined') { callback = function () {}; }

    payload = { email: email, password: password };
    socket.emit('auth/login', payload, function (response) {
      console.log('auth/login response');
      if (response.hasOwnProperty('token')) {
        // Success
        console.log('login successful');
        storage.setItem(TOKEN_KEY, response.token);
        self.emit('login');
        callback(null);
      } else if (response.hasOwnProperty('error')) {
        // Failure
        console.log('login failed, possibly invalid email or password');
        callback({
          name: response.error
        });
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

  this.getPayload = function () {
    return jwtDecode(this.getToken());
  };
}
