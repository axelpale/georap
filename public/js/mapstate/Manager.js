// mapstate.Manager
//
// Responsible:
// - storing the last known center and zoom of a given google.maps.Map
//   instance.
// - initializing the center and zoom of the given instance.
//
// Rules:
// - Whenever user's location on the map changes, the new location
//   should be stored device-wise.
// - On a fresh session, try to retrieve geolocation from the browser.
// - If no location is stored and none can be retrieved from the browser,
//   fallback to southern finland.
//
// Notes:
// An google.maps.Map instance fires 'bounds_changed' event when either
// coordinates or zoom level change.

module.exports = function (map, store, defaultState) {
  // Parameters:
  //   map
  //     map.Controller instance. This instance will be listened for
  //     viewport changes (bounds_changed) and also initialized if
  //     a previous location is known.
  //   statestore
  //     A mapstate.Store instance.
  //     The last known geolocation will be stored there.
  //   defaultState
  //     {lat: <number>, lng: <number>, zoom: <number>}

  if (typeof defaultState !== 'object') {
    throw new Error('Invalid parameters');
  }

  map.on('state_changed', function (state) {
    store.update(state);
  });

  // Init map state
  if (store.isEmpty()) {
    // Fallback to default.
    map.setState(defaultState);
  } else {
    map.setState(store.get());
  }
};
