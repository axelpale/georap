var account = require('./account');

exports.getInEverySystem = function (geom, callback) {

  var params = {
    geometry: geom,
  };

  $.ajax({
    url: '/api/geometry',
    method: 'GET',
    data: params,
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (coordinates) {
      console.log('result', coordinates);
      return callback(null, coordinates);
    },
    error: function (jqxhr) {
      var err = new Error(jqxhr.statusText);
      err.code = jqxhr.status;
      return callback(err);
    },
  });
};
