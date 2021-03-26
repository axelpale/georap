// https://maps.googleapis.com/maps/api/place/findplacefromtext/json
//   ?key=<api key>
//   &inputtype=textquery
//   &locationbias=point:<lat>,<lng>
//   &fields=formatted_address,name,geometry
//   &input=<keywords>

exports.geocode = function (address, callback) {
  // Wait recursively until google is available.
  if (!window.google) {
    var waitTime = 1000; // ms
    setTimeout(function () {
      exports.geocode(address, callback);
    }, waitTime);
    return;
  }

  if (typeof address !== 'string') {
    console.error('Invalid address: ', address);
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
