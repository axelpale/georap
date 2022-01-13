// In this version increase:
// 1. set schema version to 14
// 2. users have new property: securityToken
// 3. users have new property: role (deprecates prop: admin)
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
    console.log('2. Add securityToken and role properties to users...');

    const coll = db.collection('users');

    iter.updateEach(coll, (origUser, iterNext) => {
      const user = clone(origUser);
      // Set role
      const isAdmin = user.admin;
      delete user.admin;
      user.role = isAdmin ? 'admin' : 'basic';
      // Set empty security token
      user.securityToken = '';
      return iterNext(null, user);
    }, (err, iterResults) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  ' + iterResults.numDocuments + ' users processed ' +
        'successfully.');
      console.log('  ' + iterResults.numUpdated + ' users updated, ' +
        (iterResults.numDocuments - iterResults.numUpdated) + ' did not ' +
        'need an update');

      return nextStep();
    });
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
