//var db = require('../../services/db');
var pjson = require('../../../package.json');
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

  async.series([
    function (done) {
      exports.getServerVersion(function (err, v) {
        if (err) {
          return done(err);
        }
        return done(null, ['serverVersion', v]);
      });
    },
  ], function (err, results) {
    if (err) {
      return callback(err);
    }

    // Convert result arrays into an object
    var obj = results.reduce(function (acc, val) {
      var key = val[0];
      var value = val[1];
      acc[key] = value;
      return acc;
    }, {});

    return callback(null, obj);
  });

};
