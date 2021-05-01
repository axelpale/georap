const db = require('georap-db');
const iter = require('../../lib/iter');
const clone = require('clone');

module.exports = (nextStep) => {
  console.log('8. Remove visit statistics from users...');

  const coll = db.collection('users');

  iter.updateEach(coll, (origUser, iterNext) => {
    const user = clone(origUser);
    delete user.locationsVisited;
    if (!user.flagsCreated) {
      user.flagsCreated = []; // init
    }
    return iterNext(null, user);
  }, (err, iterResults) => {
    if (err) {
      return nextStep(err);
    }

    console.log('  ' + iterResults.numDocuments + ' users processed ' +
      'successfully.');

    return nextStep();
  });
};
