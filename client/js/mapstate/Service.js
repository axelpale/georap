// mapstate.Service
//
// Responsible:
// - storing the last known center and zoom of a given google.maps.Map
//   instance.
// - providing the center and zoom of for a given instance.
//
// Notes:
// An google.maps.Map instance fires 'bounds_changed' event when either
// coordinates or zoom level change.

module.exports = function (store, defaultState) {
  // Parameters:
  //   statestore
  //     A mapstate.Store instance.
  //     The last known geolocation will be stored there.
  //   defaultState
  //     {lat: <number>, lng: <number>, zoom: <number>}

  if (typeof defaultState !== 'object') {
    throw new Error('Invalid parameters');
  }


  // Private helpers
  var readGoogleMapState = function (map) {
    // Parameters:
    //   map
    //     google.maps.Map instance.
    // Return:
    //   a mapState object.
    var latlng = map.getCenter();
    var state = {
      lat: latlng.lat(),
      lng: latlng.lng(),
      zoom: map.getZoom(),
      mapTypeId: map.getMapTypeId(),
    };

    return state;
  };



  // Public methods

  this.getState = function () {
    // Return a map state.
    if (store.isEmpty()) {

      return defaultState;
    }  // else

    return store.get();
  };

  this.listen = function (map) {
    // Listen map for viewport changes (idle, maptypeid_changed).

    // Parameters:
    //   map
    //     google.maps.Map instance.
    //
    // Return
    //   undefined

    var handleStateChange = function () {
      store.update(readGoogleMapState(map));
    };

    map.addListener('idle', handleStateChange);
    map.addListener('maptypeid_changed', handleStateChange);
  };
};
