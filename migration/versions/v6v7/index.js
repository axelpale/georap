/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 7
// 2. add text1 and text2 properties for each location

var db = require('../../../server/services/db');
var schema = require('../../lib/schema');
var iter = require('../../iter');
var async = require('async');
var clone = require('clone');

var FROM_VERSION = 6;
var TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with async.eachSeries in the given order.
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

  function addPoints(next) {
    console.log('2. Adding properties \'text1\' and \'text2\' ' +
                'to each location...');

    var coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);
      loc.text1 = '';
      loc.text2 = '';
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

  async.series(substeps, function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
