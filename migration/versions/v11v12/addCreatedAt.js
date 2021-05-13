const db = require('georap-db');
const iter = require('../../lib/iter');
const clone = require('clone');

module.exports = (nextStep) => {
  console.log('6. Add createdAt prop to each location...');

  const coll = db.collection('locations');

  iter.updateEach(coll, (origLoc, iterNext) => {
    if (origLoc.createdAt) {
      // Skip if already has prop
      return iterNext(null, null);
    }

    db.collection('events').findOne({
      locationId: origLoc._id,
      type: 'location_created',
    }, (err, locEv) => {
      if (err) {
        return iterNext(err);
      }

      if (!locEv) {
        const msg = 'Missing location_created event for ' + origLoc._id;
        return iterNext(new Error(msg));
      }

      const loc = clone(origLoc);
      loc.createdAt = locEv.time;
      return iterNext(null, loc);
    });
  }, (err, iterResults) => {
    if (err) {
      return nextStep(err);
    }

    console.log('  ' + iterResults.numDocuments + ' locations processed ' +
      'successfully.');
    console.log('  ' + iterResults.numUpdated + ' locations updated, ' +
      (iterResults.numDocuments - iterResults.numUpdated) + ' did not ' +
      'need an update');

    return nextStep();
  });
};
