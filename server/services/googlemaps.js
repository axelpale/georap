// Singleton to access Google Maps Services API
//
// https://github.com/googlemaps/google-maps-services-js
//
// For API reference, see:
//   https://googlemaps.github.io/google-maps-services-js
//   /docs/GoogleMapsClient.html

const config = require('georap-config');
const api = require('@googlemaps/google-maps-services-js');
const _ = require('lodash');

const googleMapsClient = new api.Client({});

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
        key: config.googleMapsServerKey,
        latlng: latlng,
        language: 'en', // 'fi',
        'result_type': 'political|natural_feature',
      },
      timeout: 1000, // ms
    })
    .then((mapsResponse) => {
      let result, places;

      if (mapsResponse.data.results.length === 0) {
        // NOTE Here was a bug prior to 2021-04-20 such that we
        // set unknown places back to []. This caused worker to
        // query Google API endlessly because worker tries to find
        // places for locations with places prop equal to []
        places = ['Remote territory'];
      } else {
        // First of the multiple results seems to be the most accurate.
        result = mapsResponse.data.results[0];

        // Response contains an array of placenames.
        // Skip the ones with type postal_code.
        places = result.address_components.filter((c) => {
          return c.types[0] !== 'postal_code';
        }).map((c) => {
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
    .catch((err) => {
      console.error(err);
      return callback(err);
    });
};
