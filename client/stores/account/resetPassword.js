module.exports = function (resetToken, newPassword, callback) {
  $.ajax({
    url: '/api/account/reset',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ password: newPassword }),
    headers: { 'Authorization': 'Bearer ' + resetToken },
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
