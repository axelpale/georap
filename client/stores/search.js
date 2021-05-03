
exports.geocode = function (address, callback) {
  // Parameters:
  //   address
  //     string
  //   callback
  //     function (err, results) where
  //       results
  //         array of { address_components, geometry, ... }
  //
  // See https://developers.google.com/maps/documentation/javascript/geocoding
  //

  // Cancel empty or one-char addresses
  if (typeof address !== 'string' || address.length < 2) {
    return callback(null, []);
  }

  // Wait recursively until google is available.
  if (!window.google) {
    var waitTime = 1000; // ms
    setTimeout(function () {
      exports.geocode(address, callback);
    }, waitTime);
    return;
  }

  var geocoder = new window.google.maps.Geocoder();

  geocoder.geocode({
    address: address,
  }, function (results, status) {
    if (status === 'OK') {
      // DEBUG console.log('Successful geocoding with result:', results);
      return callback(null, results);
    }
    console.warn(
      'Geocode was not successful ' +
      ' for the following reason: ' + status
    );
    return callback(new Error(status));
  });
};
