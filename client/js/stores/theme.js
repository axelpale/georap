// This Store takes care of reading and storing the theme state.

var storage = require('../connection/storage');
var createStore = require('./lib/createStore');

module.exports = createStore(storage, 'tresdb-theme', {
  colorScheme: 'light',
});
