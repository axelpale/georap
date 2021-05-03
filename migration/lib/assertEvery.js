const asyn = require('async');
const db = require('georap-db');

module.exports = function (collectionName, iteratee, callback) {
  // Validates each document in a MongoDB collection. Iteratee is the validator
  // function, takes in a document and must call the next(err, docOk)
  // callback function. If any docOk is false, callback is called immediately.
  //
  // NOTE TODO: uses MongoDB Node adapter's .toArray method. If collection
  // is large, memory issues may occur.
  //
  // Parameters:
  //   collectionName
  //     MongoDB collection name
  //   iteratee
  //     function (document, next)
  //       Parameters:
  //         document
  //           collection item
  //         next
  //           function (err, ok)
  //   callback
  //     function (err, result), where result is an object with props
  //       ok: boolean with value of
  //         true
  //           if each document passed the validation
  //         false
  //           if at least one document did not pass
  //       numValid:
  //         number of documents validated
  //       numDocuments
  //         number of documents in collection
  //       failedDoc:
  //         document that failed the validation. Null if results.ok.
  //
  // Example:
  //
  //   const assertEvery = require('./lib/assertEvery');
  //   assertEvery('users', function (doc, next) {
  //     return next(null, typeof doc.name === 'string');
  //   }, function (err, result) {
  //     if (err) { throw err; }
  //     // else
  //     if (result.ok) {
  //       console.log('All users valid');
  //     } else {
  //       console.log('A user was invalid');
  //     }
  //   });
  //

  const collection = db.collection(collectionName);
  collection.find().toArray((err, allDocuments) => {
    if (err) {
      return callback(err);
    }

    const numDocs = allDocuments.length;
    let numValid = 0;
    let failedDoc = null;

    asyn.everySeries(allDocuments, (doc, next) => {
      iteratee(doc, (iterateeError, isValid) => {
        if (iterateeError) {
          return next(iterateeError);
        }

        if (typeof isValid !== 'boolean') {
          return next(new Error(
            'assertEvery iteratee was called ' +
            'with non-boolean value: ' + isValid
          ));
        }

        if (isValid) {
          numValid += 1;
        } else {
          failedDoc = doc;
        }

        return next(null, isValid);
      });
    }, (err3, everyResultOk) => {
      if (err3) {
        return callback(err3);
      }

      if (!everyResultOk) {
        return callback({
          name: 'AssertionError',
          numDocuments: numDocs,
          numValid: numValid,
          failedDoc: failedDoc,
        });
      }

      return callback();
    });
  });
};
