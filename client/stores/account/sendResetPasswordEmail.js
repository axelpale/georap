var request = require('../lib/request');

module.exports = function (email, callback) {
  // Parameters
  //   email
  //     string, email to send the reset instructions
  //   callback
  //     function (err)
  //
  request.postJSON({
    url: '/api/account/reset/email',
    data: { email: email },
  }, callback);
};
