const db = require('georap-db');
const iter = require('../../lib/iter');
const entryModel = require('georap-models').entry;

module.exports = (nextStep) => {
  console.log('9. Add activeAt property to entries...');

  const coll = db.collection('entries');

  iter.updateEach(coll, (origEntry, iterNext) => {
    const modEntry = Object.assign({}, origEntry, {
      activeAt: entryModel.activeAt(origEntry),
    });
    return iterNext(null, modEntry);
  }, (err, iterResults) => {
    if (err) {
      return nextStep(err);
    }

    console.log('  ' + iterResults.numDocuments + ' entries processed ' +
      'successfully.');

    return nextStep();
  });
};
