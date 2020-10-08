/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 9
// 2. replace tags property with status and type for each location

var db = require('../../../server/services/db');
var schema = require('../../lib/schema');
var iter = require('../../iter');
var tagdog = require('./tagdog');
var asyn = require('async');
var clone = require('clone');

var FROM_VERSION = 8;
var TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
var substeps = [

  function updateSchema(next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, function (err) {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function addStatusAndType(next) {
    console.log('2. Replace tags with status and type properties...');

    var coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);
      var tags = loc.tags;
      var statusType = tagdog.tagsToStatusType(tags);
      loc.status = statusType.status;
      loc.type = statusType.type;
      delete loc.tags;

      // Convert legacy tags
      if (loc.status === 'walk-in') {
        loc.status = 'abandoned';
      }
      if (loc.type === 'campfire') {
        loc.type = 'camp';
      }

      return iterNext(null, loc);
    }, next);
  },

];

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  asyn.series(substeps, function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
