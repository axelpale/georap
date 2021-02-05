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
  var self = {};
  emitter(self);

  var _state;

  var storedState = storage.getItem(storageKey);
  if (storedState) {
    _state = JSON.parse(storedState);
  } else {
    _state = defaultState;
  }

  self.update = function (newState, opts) {
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

    if (!opts || opts.silent !== false) {
      self.emit('updated', _state);
    }
  };

  self.reset = function () {
    // Reset to default state
    self.update(defaultState);
  };

  self.isDefault = function () {
    // Check if store is in default state
    return Object.keys(defaultState).every(function (k) {
      return _state[k] === defaultState[k];
    });
  };

  self.isEmpty = function () {
    // Return
    //   false if there is a stored state, true otherwise.
    if (storage.getItem(storageKey)) {
      return false;
    }
    return true;
  };

  self.get = function () {
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

  return self;
};
