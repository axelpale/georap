var userStore = require('./user');
var request = require('../lib/request');

module.exports = function (currentPwd, securityCode, callback) {
  // Parameters:
  //   currentPwd
  //     string, current password
  //   securityCode
  //     integer, six-digit
  //   callback
  //     function (err, { key, validPassword, validCode })
  //
  return request.postJSON({
    url: '/api/account/email/' + securityCode + '/',
    data: {
      password: currentPwd,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }

    // Update auth token because its email changes.
    if (response.token) {
      userStore.setToken(response.token);
    }

    return callback(null, {
      newEmail: response.newEmail,
      oldEmail: response.oldEmail,
    });
  });
};
