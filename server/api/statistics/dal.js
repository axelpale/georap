//var db = require('tresdb-db');
var pjson = require('../../../package.json');
var locationsDal = require('../locations/dal');
var entriesDal = require('../entries/dal');
var eventsDal = require('../events/dal');
var attachmentsDal = require('../attachments/dal');
var usersDal = require('../users/dal');
var asyn = require('async');

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
    locationCount: locationsDal.count,
    entriesCount: entriesDal.count,
    eventsCount: eventsDal.count,
    attachmentsCount: attachmentsDal.count,
    usersCount: usersDal.count,
  };

  asyn.mapValues(steps, function iteratee(fn, key, done) {
    fn(done);
  }, function (err, results) {
    if (err) {
      return callback(err);
    }

    return callback(null, results);
  });

};
