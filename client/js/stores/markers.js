var account = require('./account');

exports.getWithin = function (center, radius, zoomLevel, callback) {
  // Parameters
  //   center
  //     google.maps.LatLng instance
  //   radius
  //     number of meters
  //   zoomLevel
  //     only locations on this layer and above will be fetched.
  //   callback
  //     function (err, markerLocations)

  $.ajax({
    url: '/api/markers',
    method: 'GET',
    data: {
      lat: center.lat(),
      lng: center.lng(),
      radius: radius,
      layer: zoomLevel,
    },
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (rawMarkers) {
      return callback(null, rawMarkers);
    },
    error: function (jqxhr, textStatus, errorThrown) {
      return callback(errorThrown);
    },
  });
};
