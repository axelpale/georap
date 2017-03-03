var async = require('async');
var ObjectID = require('mongodb').ObjectID;

exports.updateEach = function (collection, iteratee, callback) {
  // Replace each document in a MongoDB collection. Iteratee is the update
  // function, takes in a document and must call the next(err, updatedDocument)
  // callback function.
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
  //     function (err)
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

  collection.find().toArray(function (err, allDocuments) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(allDocuments, function (doc, eachNext) {
      var id = doc._id;  // Take before modification

      // Ensure ObjectID.
      if (typeof id === 'string') {
        id = new ObjectID(id);
      }

      iteratee(doc, function next(iterateeError, updatedDoc) {
        if (iterateeError) {
          return eachNext(iterateeError);
        }

        // Ensure _id is not replaced by an _id literal.
        delete updatedDoc._id;

        collection.replaceOne({ _id: id }, updatedDoc, {}, function (err2) {
          if (err2) {
            return eachNext(err2);
          }
          return eachNext(null);
        });
      });
    }, function afterEachNexts(err3) {
      if (err3) {
        return callback(err3);
      }

      return callback(null);
    });
  });
};
