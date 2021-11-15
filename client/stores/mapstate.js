// This Store takes care of reading and storing a map viewport state
// to a given storage, e.g. localStorage.
//
// The structure of the state:
//   {
//     lat: <number>,
//     lng: <number>,
//     zoom: <integer>,
//     mapTypeId: <string>,
//   }
//
// API
//   Constructor
//     createStore(storage, storageKey, defaultState)
//   Methods
//     update(stateDelta, opts)
//     reset()
//     isDefault()
//     isEmpty()
//     get()
//   Emits
//     'updated' with state
//
var createStore = require('./lib/createStore');
var storage = require('../connection/storage');

var DEFAULT_STATE = georap.config.defaultMapState;

module.exports = createStore(storage, 'georap-geo-location', DEFAULT_STATE);
