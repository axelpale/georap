/* eslint-disable no-sync */

// Load the example dataset to the database.
// WARNING Deletes the current database and uploads.
//
// Usage
//   npm run migrate:example
//  OR
//   node migration/loadExample.js

var config = require('tresdb-config');
var fixture = require('./fixtures/example');
var loadFixture = require('./lib/loadFixture');

var db = require('tresdb-db');
var fse = require('fs-extra');
var path = require('path');

// Files.
// Clear uploadDir before new files.
fse.emptyDirSync(config.uploadDir);
// Copy in uploaded-like files.
var from = path.join(__dirname, 'fixtures', 'uploads', 'radar.jpg');
var to = path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from, to);
// Thumbnail
var from2 = path.join(__dirname, 'fixtures', 'uploads', 'radar_medium.jpg');
var to2 = path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar_medium.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from2, to2);

// Database.
db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  loadFixture(fixture, function (err) {
    if (err) {
      console.error('Loading sample data failed.');
      console.error(err);
    } else {
      console.log('Sample was loaded successfully.');
    }

    db.close();
  });
});
