var Emitter = require('component-emitter');

var TOKEN_KEY = 'tresdb-session-token';

module.exports = function AuthController(socket, storage) {
  Emitter(this);
  var self = this;

  this.login = function (email, password, callback) {
    // Parameters:
    //   TODO
    // Emits:
    //   login
    //     On successful login.

    if (typeof callback === 'undefined') { callback = function () {}; }

    // TODO replace dummy query
    if (email === 'foo@bar.com' && password === 'baz') {
      var token = '123456789';
      storage.setItem(TOKEN_KEY, token);
      self.emit('login');
      callback(null);
    } else {
      callback(new Error('Invalid username or password'));
    }
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
