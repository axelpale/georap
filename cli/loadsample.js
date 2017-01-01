// Load sample data to main database.
//
// Usage
//   node loadsample.js

var local = require('../config/local');
var fixture = require('./fixtures/sample');
var tools = require('../specs/tools');

var mongoClient = require('mongodb').MongoClient;

mongoClient.connect(local.mongo.url, function (dbErr, db) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  tools.loadFixture(db, fixture, function (err) {
    if (err) {
      console.error('Loading sample data failed.');
      console.error(err);
    } else {
      console.log('Sample was loaded successfully.');
    }

    db.close();
  });
});
