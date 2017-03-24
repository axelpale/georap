//var db = require('../../services/db');
var pjson = require('../../../package.json');
var locsDal = require('../locations/dal');
var async = require('async');

exports.getServerVersion = function (callback) {
  // Callback with error and version tag
  //
  return callback(null, pjson.version);
};

exports.getAll = function (callback) {
  // Parameters:
  //   callback
  //     function (err, results)
  //
  // Results object contains:
  //   serverVersion
  //     string
  //   locationCount
  //     integer

  var steps = {
    serverVersion: exports.getServerVersion,
    locationCount: locsDal.count,
  };

  async.mapValues(steps, function iteratee(fn, key, done) {
    fn(done);
  }, function (err, results) {
    if (err) {
      return callback(err);
    }

    return callback(null, results);
  });

};
