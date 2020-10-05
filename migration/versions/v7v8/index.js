/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 8
// 2. read blacklist
// 3. write a status property for each user according to the blacklist
// 4. remove the blacklist

var db = require('../../../server/services/db');
var schema = require('../../lib/schema');
var iter = require('../../iter');
var async = require('async');
var clone = require('clone');

var FROM_VERSION = 7;
var TO_VERSION = FROM_VERSION + 1;

// Collect blacklist here before using and removing it.
var _blacklist;

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

  function readBlacklist(next) {
    console.log('2. Reading deprecated blacklist...');

    var coll = db.collection('config');

    coll.findOne({ key: 'blacklist' }, function (err, blist) {
      if (err) {
        return next(err);
      }

      if (blist) {
        _blacklist = blist.value;
      } else {
        // It might not exist
        _blacklist = [];
      }

      console.log('Blacklist read:', _blacklist);

      return next();
    });
  },

  function addStatuses(next) {
    console.log('3. Adding property \'status\' ' +
                'to each user...');
    var coll = db.collection('users');

    iter.updateEach(coll, function (origUser, iterNext) {
      var u = clone(origUser);
      u.status = 'active';
      return iterNext(null, u);
    }, next);
  },

  function removeBlacklist(next) {
    console.log('4. Removing blacklist...');

    var coll = db.collection('config');

    coll.removeOne({ key: 'blacklist' }, function (err) {
      if (err) {
        return next(err);
      }

      console.log('Blacklist removed successfully.');
      return next();
    });
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
