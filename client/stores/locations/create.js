var request = require('../lib/request');

module.exports = function (geom, callback) {
  // Create a new location on the server.
  //
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, rawLoc)
  //

  return request.postJSON({
    url: '/api/locations',
    data: {
      lat: geom.coordinates[1],
      lng: geom.coordinates[0],
    },
  }, function (err, rawLoc) {
    if (err) {
      return callback(err);
    }

    if (rawLoc === 'TOO_CLOSE') {
      return callback(new Error('TOO_CLOSE'));
    }

    return callback(null, rawLoc);
  });
};
