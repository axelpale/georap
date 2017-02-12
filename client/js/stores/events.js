var emitter = require('component-emitter');

var account = require('./account');

emitter(exports);

exports.getRecent = function (page, callback) {

  $.ajax({
    url: '/api/events',
    method: 'GET',
    data: {
      page: page,
    },
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (data) {
      return callback(null, data);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(errorThrown);
    },
  });

};
