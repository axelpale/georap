/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 11
// 2. create createdAt and loginAt properties for each user.
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('georap-db');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const asyn = require('async');
const clone = require('clone');
const findFirstAndLastEvent = require('./findFirstAndLastEvent');

const FROM_VERSION = 10;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, (err) => {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function addTimeProps(next) {
    console.log('2. Adding createdAt and loginAt properties for each user...');

    const coll = db.collection('users');
    // Without further knowledge, act like users are created and logged
    // in just now.
    const now = (new Date()).toISOString();

    iter.updateEach(coll, (origUser, iterNext) => {

      // Use the earliest event as the creation time.
      // Use the latest event as the login time.
      // If no events, use now.
      findFirstAndLastEvent(origUser.name, (erre, firstLastEv) => {
        if (erre) {
          return iterNext(erre);
        }

        const u = clone(origUser);

        if (firstLastEv.first === null) {
          u.createdAt = now;
        } else {
          u.createdAt = firstLastEv.first.time;
        }

        if (firstLastEv.last === null) {
          u.loginAt = now;
        } else {
          u.loginAt = firstLastEv.last.time;
        }

        return iterNext(null, u);
      });
    }, next);
  },

];

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  asyn.series(substeps, (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
