// In this version increase:
// 1. set schema version to 14
// 2. users have new property: securityToken
// 3. users have new property: role (deprecates prop: admin)
// 4. rename location.creator to location.user
//
// Idempotent: true when NODE_ENV=development
//
const db = require('georap-db');
const asyn = require('async');
const clone = require('clone');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');

const FROM_VERSION = 13;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'nextStep' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(nextStep) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, (err) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  Schema version tag created:', TO_VERSION);
      return nextStep(null);
    });
  },

  function refactorEntries(nextStep) {
    console.log('2. 3. Add securityToken and role properties to users...');

    const coll = db.collection('users');

    iter.updateEach(coll, (origUser, iterNext) => {
      const user = clone(origUser);
      // Init role, remove boolean admin
      if (user.admin) {
        const isAdmin = user.admin;
        delete user.admin;
        user.role = isAdmin ? 'admin' : 'basic';
      }
      if (!user.securityToken) {
        // Init empty security token
        user.securityToken = '';
      }
      if (!user.deleted) {
        // deleted is true => no update
        // deleted is false => unnecessary update
        // deleted is undefined => update

        // Init deleted flag
        user.deleted = false;
      }
      return iterNext(null, user);
    }, iter.updateEachReport(nextStep));
  },

  function migrateLocations(nextStep) {
    console.log('4. Rename loc.creator to loc.user...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      if (loc.creator) {
        loc.user = loc.creator;
        delete loc.creator;
        return iterNext(null, loc);
      }
      return iterNext(null, false); // skip
    }, iter.updateEachReport(nextStep));
  },
];

exports.run = (callback) => {
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
