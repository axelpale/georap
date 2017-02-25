// This Store takes care of reading and storing a map viewport state
// to a given storage, e.g. localStorage.

var GEO_KEY = 'tresdb-geo-location';
var storage = require('../connection/storage');

var MapStateStore = function (defaultState) {

  this.update = function (state) {
    // Parameters:
    //   state
    //     object with keys:
    //       lat
    //         number
    //       lng
    //         number
    //       zoom
    //         number
    //       mapTypeId
    //         string
    if (typeof state !== 'object' ||
        typeof state.lat !== 'number' ||
        typeof state.lng !== 'number' ||
        typeof state.zoom !== 'number' ||
        typeof state.mapTypeId !== 'string') {
      throw new Error('Invalid parameters');
    }  // else

    // Build the string to store
    var s = JSON.stringify(state);

    // Store the string
    storage.setItem(GEO_KEY, s);
  };

  this.isEmpty = function () {
    // Return
    //   false if there is a viewport stored, other than default
    //   true otherwise
    if (storage.getItem(GEO_KEY)) {
      return false;
    }  // else

    return true;
  };

  this.get = function () {
    // Get the stored viewport state
    // If there is no state stored, returns the default state.
    //
    // Return:
    // {
    //   lat: <number>,
    //   lng: <number>,
    //   zoom: <number>,
    //   mapTypeId: <string>
    // }
    var s = storage.getItem(GEO_KEY);

    if (s) {
      return JSON.parse(s);
    }  // else

    return defaultState;
  };
};

// Singleton
module.exports = new MapStateStore({
  // Default map state
  lat: 61.0,
  lng: 24.0,
  zoom: 6,
  // 'hybrid' is darker and more practical than 'roadmap'
  mapTypeId: 'hybrid',
});
