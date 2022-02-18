var request = require('../lib/request');

module.exports = function (currentPassword, newPassword, callback) {
  // Change user password. Requires token to be set.
  //
  // Parameters:
  //   currentPassword
  //     Server ensures that user knows the current password before
  //     changing.
  //   newPassword
  //   callback
  //     function (err). If success, err is null.
  //
  request.postJSON({
    url: '/api/account/password',
    data: {
      currentPassword: currentPassword,
      newPassword: newPassword,
    },
  }, callback);
};
