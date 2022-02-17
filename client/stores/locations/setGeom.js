var request = require('../lib/request');
var validateCoords = require('../lib/validateCoords');

module.exports = function (id, lng, lat, callback) {
  // Parameters:
  //   id
  //     location id
  //   lng
  //     number
  //   lat
  //     number
  //   callback
  //     function (err)
  //
  if (!validateCoords.isValidLongitude(lng)) {
    return callback(new Error('Invalid coordinate'));
  }
  if (!validateCoords.isValidLatitude(lat)) {
    return callback(new Error('Invalid coordinate'));
  }

  return request.postJSON({
    url: '/api/locations/' + id + '/geom',
    data: {
      lat: lat,
      lng: lng,
    },
  }, callback);
};
