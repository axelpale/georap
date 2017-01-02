// Usage:
//   $ node refresh.js

var local = require('../config/local');
var mongoClient = require('mongodb').MongoClient;
var clustering = require('../server/services/clustering');

mongoClient.connect(local.mongo.url, function (dbErr, db) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  clustering.recomputeClusters(db, function (err) {
    if (err) {
      console.log('ERROR');
      console.error(err);

      return db.close();
    }  // else

    console.log('Clusters recomputed.');

    return db.close();
  });
});
