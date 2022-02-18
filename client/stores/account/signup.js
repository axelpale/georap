module.exports = function (signupToken, username, password, callback) {
  // Parameters
  //   signupToken
  //     The token user received in email. Contains email address
  //   username
  //   password
  //   callback
  //
  var payload = {
    username: username,
    password: password,
  };

  $.ajax({
    url: '/api/account/signup',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    headers: { 'Authorization': 'Bearer ' + signupToken },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};
