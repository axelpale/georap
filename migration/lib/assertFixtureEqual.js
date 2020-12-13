/* eslint-disable no-loop-func, max-statements */
// A tool to test if a collection is equal to a fixture.
// Currently this can test only collections with single document.

var db = require('tresdb-db');
var fixtures = require('../fixtures');
var _ = require('lodash');
var clone = require('clone');

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
  var v = versionTag;
  var c = collectionName;

  var fixColl = fixtures[v].collections[c];

  db.collection(c).find().toArray(function (err, docs) {
    if (err) {
      return callback(err);
    }

    // Possible assertion error here
    var assertionError = null;

    // Compare all docs.
    for (var i = 0; i < fixColl.length; i += 1) {
      // Clone because otherwise edits affect some cache and
      // may yield errors elsewhere
      var fixDoc = clone(fixColl[i]);
      var realDoc = clone(docs[i]);

      // _id are generated and thus always differ
      delete realDoc._id;
      delete fixDoc._id;
      if (realDoc.data) {
        delete realDoc.data.entryId;
      }
      if (fixDoc.data) {
        delete fixDoc.data.entryId;
      }

      // Deep compare & find differences both ways.
      // See http://stackoverflow.com/a/31686152/638546
      var diffs1 = _.reduce(realDoc, function (result, value, key) {
        return _.isEqual(value, fixDoc[key]) ? result : result.concat(key);
      }, []);

      var diffs2 = _.reduce(fixDoc, function (result, value, key) {
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
