// This Store takes care of reading and storing state data
// to a given storage, e.g. localStorage.

var emitter = require('component-emitter');

module.exports = function (storage, storageKey, defaultState) {
  // Parameters
  //   storage
  //     e.g. localStorage or sessionStorage object
  //   storageKey
  //     string
  //   defaultState
  //     object
  //
  // Return
  //   a new store object
  //
  var store = {};
  emitter(store);

  var _state;

  var storedState = storage.getItem(storageKey);
  if (storedState) {
    _state = JSON.parse(storedState);
  } else {
    _state = defaultState;
  }

  store.update = function (newState, opts) {
    // Parameters:
    //   newState
    //     object with optional keys:
    //       type
    //         string, a valid location type OR 'any'
    //       status
    //         string, a valid location status OR 'any'
    //  opts
    //    optional object with optional keys
    //      silent
    //        set true to prevent 'update' event emission
    //
    if (typeof newState !== 'object') {
      throw new Error('Invalid filter settings');
    }

    // Copy next state so that we do not end up modifing the default state.
    _state = Object.assign({}, _state, newState);

    // Build the string to store
    var s = JSON.stringify(_state);

    // Store the string
    storage.setItem(storageKey, s);

    if (!opts || opts.silent !== true) {
      store.emit('updated', _state);
    }
  };

  store.reset = function () {
    // Reset to default state
    store.update(defaultState);
  };

  store.isDefault = function () {
    // Check if store is in default state
    return Object.keys(defaultState).every(function (k) {
      return _state[k] === defaultState[k];
    });
  };

  store.isEmpty = function () {
    // Return
    //   false if there is a stored state, true otherwise.
    if (storage.getItem(storageKey)) {
      return false;
    }
    return true;
  };

  store.get = function () {
    // Get the stored state
    // If there is no state stored, returns the default state.
    //
    if (_state !== defaultState) {
      return _state;
    }

    var s = storage.getItem(storageKey);

    if (s) {
      return JSON.parse(s);
    }  // else

    return defaultState;
  };

  return store;
};
