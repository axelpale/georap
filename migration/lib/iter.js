var async = require('async');
var ObjectID = require('mongodb').ObjectID;

exports.updateEach = function (collection, iteratee, callback) {
  // Update each document in a MongoDB collection. Iteratee is the update
  // function, takes in a document and must call the next(updatedDocument)
  // callback function.
  //
  // Parameters:
  //   collection
  //     Monk DB collection
  //   iteratee
  //     function (document, save)
  //       Parameters:
  //         document
  //           collection item
  //         next
  //           function (updatedDocument)
  //   callback
  //     function (err)
  //
  // Example:
  //
  //   var iter = require('./lib/iter');
  //   var users = db.collection('users');
  //   iter.updateEach(users, function (doc, next) {
  //     doc.name = 'Dr. ' + doc.name;
  //     next(doc);
  //   }, function (err) {
  //     if (err) { throw err; }
  //     // else
  //     console.log('Now, everybody is a Doctor.');
  //   });
  //

  collection.find({}).then(function (allDocuments) {
    async.eachSeries(allDocuments, function (doc, next2) {
      var id = doc._id;  // Take before modification

      // Ensure ObjectID.
      if (typeof id === 'string') {
        id = new ObjectID(id);
      }

      iteratee(doc, function (updatedDoc) {

        // Ensure _id is not replaced by an _id literal.
        delete updatedDoc._id;

        collection.update(id, updatedDoc).then(function () {
          // Parameters:
          //   info
          return next2();
        }).catch(function (err2) {
          return next2(err2);
        });
      });
    }, function afterNext2s(err) {
      collection.find({}).then(function () {
        // Parameters:
        //   docs
        return callback(err);
      }).catch(function (err3) {
        return callback(err3);
      });
    });
  }).catch(function onError(err) {
    return callback(err);
  });
};
