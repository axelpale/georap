// When a version changes, old client-side storage content might become bad.
// For an example, when roles were introduced in v14, the old session token
// had no roles and thus prevented any login or logout features to be seen.
//
var storage = require('../connection/storage');
var VERSION_KEY = 'georap-version';

var keys = [
  'georap-filter',
  'georap-tab',
  'georap-session-token',
  'georap-geo-location',
  'georap-theme',
];

var clear = function () {
  keys.forEach(function (key) {
    storage.removeItem(key);
  });
  console.log('storages cleared');
};

module.exports = function () {
  // Detect version (if any)
  var ver = storage.getItem(VERSION_KEY);

  if (ver) {
    if (ver === georap.version) {
      // Everything in order
      return;
    }
  }

  // Otherwise clear all and set new version
  clear();
  storage.setItem(VERSION_KEY, georap.version);
};
