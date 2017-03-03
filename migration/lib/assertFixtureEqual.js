// A tool to test if a collection is equal to a fixture.
// Currently this can test only collections with single document.

var db = require('../../server/services/db');
var fixtures = require('../fixtures');
var _ = require('lodash');
var clone = require('clone');

module.exports = function (collectionName, versionTag, callback) {
  // Compares current collection to a same collection in the fixture specified
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

    // Compare only firsts.
    // Clone because otherwise edits affect some cache and yield errs elsewhere
    var fixFirst = clone(fixColl[0]);
    var realFirst = clone(docs[0]);

    // _id are generated and thus always differ
    delete realFirst._id;
    delete fixFirst._id;

    // Deep compare & find differences both ways.
    // See http://stackoverflow.com/a/31686152/638546
    var diffs1 = _.reduce(realFirst, function (result, value, key) {
      return _.isEqual(value, fixFirst[key]) ? result : result.concat(key);
    }, []);

    var diffs2 = _.reduce(fixFirst, function (result, value, key) {
      return _.isEqual(value, realFirst[key]) ? result : result.concat(key);
    }, []);

    if (diffs1.length === 0 && diffs2.length === 0) {
      return callback();
    }

    // Print out so that we can see the differences.
    console.log('Data in db.' + collectionName + ':');
    console.log(realFirst);
    console.log('Data in fixture.' + collectionName + ':');
    console.log(fixFirst);

    return callback({
      name: 'AssertionError',
      diffs: diffs1.concat(diffs2),
    });
  });
};
