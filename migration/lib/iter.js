var async = require('async');

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
  //   var users = db.get('users');
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
    async.each(allDocuments, function (doc, next) {
      var id = doc._id;  // Take before modification
      iteratee(doc, function (updated) {
        collection.update(id, updated, function (err) {
          if (err) {
            return next(err);
          }  // else
          return next();
        });
      });
    }, function eachCb(err) {
      return callback(err);
    });
  }).catch(function onError(err) {
    return callback(err);
  });
};
