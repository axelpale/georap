var request = require('./lib/request');
var emitter = require('component-emitter');

// Init
emitter(exports);

// Public methods

exports.getAll = function (callback) {
  // Get all statistics as a single object
  //
  // Parameters:
  //   callback
  //     function (err, stats)
  //
  request.getJSON({
    url: '/api/statistics',
  }, callback);
};
