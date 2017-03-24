var account = require('../account');

exports.getJSON = function (url, callback) {
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (result) {
      return callback(null, result);
    },
    error: function (jqxhr, statusCode, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};
