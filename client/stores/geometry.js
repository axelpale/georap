var request = require('./lib/request');

exports.getInEverySystem = function (geom, callback) {
  // Get geom in all configured coordinate systems.
  // Use POST request to send GeoJSON as is.
  //
  // Parameters:
  //   geom
  //     GeoJSON
  //   callback
  //     fn (err, geoms), where
  //       geoms
  //         { <systemName>: [x, y], ... }
  //
  return request.postJSON({
    url: '/api/geometry',
    data: {
      geometry: geom,
    },
  }, callback);
};

exports.parseCoordinates = function (params, callback) {
  // Parse textual coordinates in various systems and convert to WGS84.
  //
  // Parameters
  //   params, object with props
  //     system
  //     text
  //   callback
  //     fn (err, coords), where
  //       coords is an array of objects with props:
  //         system
  //           string, system name e.g. 'WGS84'
  //         xy
  //           object { x, y }
  //
  return request.getJSON({
    url: '/api/geometry/parse',
    data: {
      system: params.system,
      text: params.text,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null, response.coordinates);
  });
};
