/* eslint-disable no-loop-func, max-statements */
// A tool to test if a collection is equal to a fixture.
// Currently this can test only collections with single document.

const db = require('tresdb-db');
const fixtures = require('../fixtures');
const _ = require('lodash');
const clone = require('clone');

module.exports = function (collectionName, versionTag, callback) {
  // Compares current collection in database
  // to a same collection in the fixture specified
  // by versionTag.
  //
  // Parameters
  //   collectionName
  //     collection in the fixture e.g. 'locations'
  //   versionTag
  //     version of the fixture e.g. 'v5'
  //   callback
  //     function (err)
  //       err.name === 'AssertionError'
  //         if real collection an fixture collection are not deep equal.

  // short alias
  const v = versionTag;
  const c = collectionName;

  const fixColl = fixtures[v].collections[c];

  db.collection(c).find().toArray((err, docs) => {
    if (err) {
      return callback(err);
    }

    // Possible assertion error here
    let assertionError = null;

    // Compare all docs.
    for (let i = 0; i < fixColl.length; i += 1) {
      // Clone because otherwise edits affect some cache and
      // may yield errors elsewhere
      const fixDoc = clone(fixColl[i]);
      const realDoc = clone(docs[i]);

      // _id are generated and thus always differ
      delete realDoc._id;
      delete fixDoc._id;
      if (realDoc.data) {
        delete realDoc.data.entryId;
      }
      if (fixDoc.data) {
        delete fixDoc.data.entryId;
      }
      // Attachment keys are generated in v11v12 and thus differ.
      // Therefore test only for length.
      if (realDoc.attachments) {
        realDoc.attachments = realDoc.attachments.map(() => 'attakey');
      }
      if (fixDoc.attachments) {
        fixDoc.attachments = fixDoc.attachments.map(() => 'attakey');
      }
      if (realDoc.data) {
        if (realDoc.data.entry && realDoc.data.entry.attachments) {
          const a = realDoc.data.entry.attachments;
          realDoc.data.entry.attachments = a.map(() => 'attakey');
        }
        if (realDoc.data.original && realDoc.data.original.attachments) {
          const a = realDoc.data.original.attachments;
          realDoc.data.original.attachments = a.map(() => 'attakey');
          const b = realDoc.data.delta.attachments;
          realDoc.data.delta.attachments = b.map(() => 'attakey');
        }
      }
      if (fixDoc.data) {
        if (fixDoc.data.entry && fixDoc.data.entry.attachments) {
          const a = fixDoc.data.entry.attachments;
          fixDoc.data.entry.attachments = a.map(() => 'attakey');
        }
        if (fixDoc.data.original && fixDoc.data.original.attachments) {
          const a = fixDoc.data.original.attachments;
          fixDoc.data.original.attachments = a.map(() => 'attakey');
          const b = fixDoc.data.delta.attachments;
          fixDoc.data.delta.attachments = b.map(() => 'attakey');
        }
      }

      // Deep compare & find differences both ways.
      // See http://stackoverflow.com/a/31686152/638546
      const diffs1 = _.reduce(realDoc, (result, value, key) => {
        return _.isEqual(value, fixDoc[key]) ? result : result.concat(key);
      }, []);

      const diffs2 = _.reduce(fixDoc, (result, value, key) => {
        return _.isEqual(value, realDoc[key]) ? result : result.concat(key);
      }, []);

      if (diffs1.length !== 0 || diffs2.length !== 0) {
        // Print out so that we can see the differences.
        console.log('Data in db.' + collectionName + ':');
        console.log(realDoc);
        console.log('Data in fixture.' + collectionName + ':');
        console.log(fixDoc);

        assertionError = {
          name: 'AssertionError',
          diffs: diffs1.concat(diffs2),
        };
        // Do not search more
        break;
      }
    }

    if (assertionError) {
      return callback(assertionError);
    }
    // Else all OK
    return callback();
  });
};
