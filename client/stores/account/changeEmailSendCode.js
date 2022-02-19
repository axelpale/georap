var request = require('../lib/request');

module.exports = function (newEmail, callback) {
  // Parameters:
  //   newEmail
  //     string, email address where
  //       the email verification message
  //       will be sent.
  //   callback
  //     function (err, { message })
  //
  return request.postJSON({
    url: '/api/account/email',
    data: {
      newEmail: newEmail,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null, {
      message: response.message,
    });
  });
};
