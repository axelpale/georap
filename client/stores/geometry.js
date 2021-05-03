var account = require('./account');

exports.getInEverySystem = function (geom, callback) {

  var params = {
    geometry: geom,
  };

  $.ajax({
    url: '/api/geometry',
    method: 'POST', // get cannot have JSON body
    data: JSON.stringify(params), // request data
    contentType: 'application/json', // request data type
    processData: false, // already string
    dataType: 'json', // response data type
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (coordinates) {
      return callback(null, coordinates);
    },
    error: function (jqxhr) {
      var err = new Error(jqxhr.statusText);
      err.code = jqxhr.status;
      return callback(err);
    },
  });
};
