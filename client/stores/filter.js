// This Store takes care of reading and storing the map filter state
// to localStorage.

var storage = require('../connection/storage');
var createStore = require('./lib/createStore');

module.exports = createStore(storage, 'tresdb-filter', {
  // Default pass-all filter
  type: 'any',
  status: 'any',
});
