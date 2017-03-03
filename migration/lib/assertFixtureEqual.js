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
    var realFirst = clone(fixColl[0]);
    var fixFirst = clone(docs[0]);

    // _id are generated and thus always differ
    delete realFirst._id;
    delete fixFirst._id;

    // Deep compare & find differences.
    // See http://stackoverflow.com/a/31686152/638546
    var diffs = _.reduce(realFirst, function (result, value, key) {
      return _.isEqual(value, fixFirst[key]) ? result : result.concat(key);
    }, []);

    if (diffs.length === 0) {
      return callback();
    }

    // Print out so that we can see the differences.
    console.log('Data in db:');
    console.log(realFirst);
    console.log('Data in fixture:');
    console.log(fixFirst);

    return callback({
      name: 'AssertionError',
      diffs: diffs,
    });
  });
};
