const asyn = require('async');
const db = require('georap-db');

exports.updateEach = function (collection, iteratee, callback) {
  // Replace each document in a MongoDB collection. Iteratee is the update
  // function, takes in a document and must call the next(err, updatedDocument)
  // callback function. If updatedDocument is null or false, that document
  // is left unaltered.
  //
  // Parameters:
  //   collection
  //     MongoDB collection
  //   iteratee
  //     function (document, next)
  //       Parameters:
  //         document
  //           collection item
  //         next
  //           function (err, updatedDocument)
  //   callback
  //     function (err, stats), where stats is an object with props:
  //       numDocuments
  //         integer, num of read/processed documents
  //       numUpdated
  //         integer, num of changed documents i.e. where iteratee returned
  //           other than null.
  //
  // Example:
  //
  //   var iter = require('./lib/iter');
  //   var users = db.collection('users');
  //   iter.updateEach(users, function (doc, next) {
  //     doc.name = 'Dr. ' + doc.name;
  //     next(null, doc);
  //   }, function (err) {
  //     if (err) { throw err; }
  //     // else
  //     console.log('Now, everybody is a Doctor.');
  //   });
  //

  collection.find().toArray((err, allDocuments) => {
    if (err) {
      return callback(err);
    }

    const numDocs = allDocuments.length;
    let numUpdated = 0;

    asyn.eachSeries(allDocuments, (doc, eachNext) => {
      let id = doc._id;  // Take before modification

      // Ensure ObjectID.
      if (typeof id === 'string') {
        id = db.id(id);
      }

      try {
        iteratee(doc, (iterateeError, updatedDoc) => {
          if (iterateeError) {
            return eachNext(iterateeError);
          }

          // Skip null docs, no need to replace.
          if (updatedDoc === null || updatedDoc === false) {
            return eachNext(null);
          }

          // Ensure _id is not replaced by an _id literal.
          delete updatedDoc._id;

          collection.replaceOne({ _id: id }, updatedDoc, {}, (err2) => {
            if (err2) {
              return eachNext(err2);
            }

            numUpdated += 1;

            return eachNext(null);
          });
        });
      } catch (e) {
        return eachNext(e);
      }
    }, (err3) => {
      if (err3) {
        return callback(err3);
      }

      return callback(null, {
        numDocuments: numDocs,
        numUpdated: numUpdated,
      });
    });
  });
};

exports.updateEachReport = function (nextStep) {
  // Returns a callback fn for iter.updateEach that
  // outputs iterResults
  //
  return (err, iterResults) => {
    if (err) {
      return nextStep(err);
    }

    console.log('  ' + iterResults.numDocuments + ' docs processed ' +
      'successfully.');
    console.log('  ' + iterResults.numUpdated + ' docs updated, ' +
      (iterResults.numDocuments - iterResults.numUpdated) + ' did not ' +
      'need an update');

    return nextStep();
  };
};
