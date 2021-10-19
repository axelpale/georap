var request = require('./lib/request');

exports.getInEverySystem = function (geom, callback) {
  // Get geom in all configured coordinate systems.
  // Use POST request to send GeoJSON as is.
  //
  return request.postJSON({
    url: '/api/geometry',
    data: {
      geometry: geom,
    },
  }, callback);
};

exports.parseCoordinates = function (params, callback) {
  // Parameters
  //   params, object with props
  //     coordinateSystem
  //     coordinatesText
  //   callback
  //     fn (err, latlng), where
  //       latlng
  //         { lat, lng } in WGS84
  //
  return callback(null, {
    lat: 0,
    lng: 0,
  });
};
