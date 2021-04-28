//var db = require('tresdb-db');
const pjson = require('../../../package.json');
const locationsDal = require('../locations/dal');
const entriesDal = require('../entries/dal');
const commentsDal = require('../comments/dal');
const eventsDal = require('../events/dal');
const attachmentsDal = require('../attachments/dal');
const usersDal = require('../users/dal');
const asyn = require('async');

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

  const steps = {
    serverVersion: exports.getServerVersion,
    locationCount: locationsDal.count,
    entriesCount: entriesDal.count,
    commentsCount: commentsDal.count,
    eventsCount: eventsDal.count,
    attachmentsCount: attachmentsDal.count,
    usersCount: usersDal.count,
  };

  asyn.mapValues(steps, (fn, key, done) => {
    fn(done);
  }, (err, results) => {
    if (err) {
      return callback(err);
    }

    return callback(null, results);
  });

};
