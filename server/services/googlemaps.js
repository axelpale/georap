// Singleton to access Google Maps Services API
//
// https://github.com/googlemaps/google-maps-services-js
//
// For API reference, see:
//   https://googlemaps.github.io/google-maps-services-js
//   /docs/GoogleMapsClient.html

var config = require('tresdb-config');
var api = require('@googlemaps/google-maps-services-js');
var _ = require('lodash');

var googleMapsClient = new api.Client({});

exports.LIMIT_PER_SECOND = 50;
exports.LIMIT_PER_DAY = 2500;

exports.reverseGeocode = function (latlng, callback) {
  // Parameters:
  //   latlng
  //     array [lat, lng]
  //   callback
  //     function (err, places)
  //       places
  //         array of strings, name of the smallest place first
  //
  googleMapsClient
    .reverseGeocode({
      params: {
        key: config.googleMapsKey,
        latlng: latlng,
        language: 'en', // 'fi',
        'result_type': 'political',
      },
      timeout: 1000, // ms
    })
    .then(function (mapsResponse) {
      var result, places;

      if (mapsResponse.data.results.length === 0) {
        places = [];
      } else {
        // First of the multiple results seems to be the most accurate.
        result = mapsResponse.data.results[0];

        // Response contains an array of placenames.
        // Skip the ones with type postal_code.
        places = result.address_components.filter(function (c) {
          return c.types[0] !== 'postal_code';
        }).map(function (c) {
          return c.long_name;
        });

        // Remove duplicates. For example Päärnäinen in Finland yields:
        // [Päärnäinen, Pori, Pori, Pori, Satakunta, Finland] while
        // [Päärnäinen, Pori, Satakunta, Finland] is wanted.
        places = _.uniq(places);
      }

      // console.log(mapsResponse.json.results);
      // console.log(places);

      return callback(null, places);
    })
    .catch(function (err) {
      console.error(err);
      return callback(err);
    });
};
