// This Store takes care of reading and storing a map viewport state
// to a given storage, e.g. localStorage.

var STORAGE_KEY = 'tresdb-filter';
var emitter = require('component-emitter');
var storage = require('../connection/storage');

var DEFAULT_STATE = {
  // Default pass-all filter
  type: 'any',
  status: 'any',
};

var FilterStore = function () {
  emitter(this);

  var _state;

  var storedState = storage.getItem(STORAGE_KEY);
  if (storedState) {
    _state = JSON.parse(storedState);
  } else {
    _state = DEFAULT_STATE;
  }

  this.update = function (newState, opts) {
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

    // Copy next state so that we do not end up modifing the DEFAULT_STATE.
    _state = Object.assign({}, _state);

    if (typeof newState.type === 'string') {
      _state.type = newState.type;
    }

    if (typeof newState.status === 'string') {
      _state.status = newState.status;
    }

    if (!opts) {
      opts = {};
    }
    opts.silent = typeof opts.silent === 'boolean' ? opts.silent : false;

    // Build the string to store
    var s = JSON.stringify(_state);

    // Store the string
    storage.setItem(STORAGE_KEY, s);

    if (!opts.silent) {
      this.emit('updated', _state);
    }
  };

  this.deactivate = function () {
    // Turn filter off.
    this.update(DEFAULT_STATE);
  };

  this.isActive = function () {
    // Filter is active when it has non-default values.
    return _state.type !== DEFAULT_STATE.type ||
      _state.status !== DEFAULT_STATE.status;
  };

  this.isEmpty = function () {
    // Return
    //   false if there is a stored state, true otherwise.
    if (storage.getItem(STORAGE_KEY)) {
      return false;
    }  // else

    return true;
  };

  this.get = function () {
    // Get the stored state
    // If there is no state stored, returns the default state.
    //
    // Return:
    // {
    //   status: <string>,
    //   type: <string>,
    // }
    //
    if (_state !== DEFAULT_STATE) {
      return _state;
    }

    var s = storage.getItem(STORAGE_KEY);

    if (s) {
      return JSON.parse(s);
    }  // else

    return DEFAULT_STATE;
  };
};

// Singleton
module.exports = new FilterStore();
