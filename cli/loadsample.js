// Load sample data to main database.
//
// Usage
//   node loadsample.js

var local = require('../config/local');
var fixture = require('./fixtures/sample');
var tools = require('../specs/tools');

var mongoClient = require('mongodb').MongoClient;
var path = require('path');
var fse = require('fs-extra');

// Files
var from = path.join(__dirname, 'fixtures', 'radar.jpg');
var to = path.join(local.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from, to);

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
