var userStore = require('./user');
var bus = require('georap-bus');

module.exports = function (email, password, callback) {
  // Parameters:
  //   email
  //     email address
  //   password
  //   callback
  //     function (err), optional
  //
  // Emits:
  //   login
  //     On successful login.

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('invalid parameters');
  }

  var payload = {
    email: email,
    password: password,
  };

  if (typeof callback !== 'function') {
    callback = function () {};
  }

  $.ajax({
    url: '/api/account/',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    success: function (tokenResponse) {

      if (typeof tokenResponse !== 'string') {
        throw new Error('invalid server response');
      }

      // Set / replace auth token
      userStore.setToken(tokenResponse);

      // Publish within client
      bus.emit('login');

      return callback();
    },
    error: function (jqxhr) {
      var err = new Error(jqxhr.responseText);
      err.name = jqxhr.statusText;
      err.code = jqxhr.status;
      return callback(err);
    },
  });
};
