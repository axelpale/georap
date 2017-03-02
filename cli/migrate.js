//var local = require('../config/local');
var migrates = require('../migration/migrates');

var db = require('../server/services/db');
//var mongoClient = require('mongodb').MongoClient;

db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  migrates.migrate(function (err) {
    if (err) {
      console.error(err);
    }

    db.close();
  });
});

// mongoClient.connect(local.mongo.url, function (dbErr, db) {
//   if (dbErr) {
//     return console.error('Failed to connect to MongoDB.');
//   }
//
//   migrates.migrate({
//     db: db,
//     callback: function (err) {
//       if (err) {
//         console.error(err);
//       }
//
//       db.close();
//     },
//   });
//
// });
