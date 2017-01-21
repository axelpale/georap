var local = require('../config/local');
var migrates = require('../migration/migrates');

var mongoClient = require('mongodb').MongoClient;

mongoClient.connect(local.mongo.url, function (dbErr, db) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  migrates.migrate({
    db: db,
    callback: function (err) {
      if (err) {
        console.error(err);
      }

      db.close();
    },
  });

});
