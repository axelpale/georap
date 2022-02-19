var request = require('../lib/request');

module.exports = function (params, callback) {
  // Create a new location on the server with name.
  //
  // Parameters:
  //   params:
  //     geometry
  //       GeoJSON Point
  //     name
  //       string
  //   callback
  //     function (err, rawLoc)
  //

  var geom = params.geometry;
  var lat = geom.coordinates[1];
  var lng = geom.coordinates[0];
  var name = params.name;

  return request.postJSON({
    url: '/api/locations',
    data: {
      lat: lat,
      lng: lng,
      name: name,
    },
  }, function (err, rawLoc) {
    if (err) {
      return callback(err);
    }

    // An error not related to the connection or request.
    if (rawLoc === 'TOO_CLOSE') {
      return callback(new Error('TOO_CLOSE'));
    }

    return callback(null, rawLoc);
  });
};
