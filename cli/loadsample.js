/* eslint-disable no-sync */

// Load sample data to main database. Deletes the current database and uploads.
//
// Usage
//   node loadsample.js

var local = require('../config/local');
var fixture = require('./fixtures/sample');
var tools = require('../specs/tools');

var db = require('../server/services/db');
var path = require('path');
var fse = require('fs-extra');

// Files.
// Clear uploadDir before new files.
fse.emptyDirSync(local.uploadDir);
// Copy in uploaded-like files.
var from = path.join(__dirname, 'fixtures', 'radar.jpg');
var to = path.join(local.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from, to);
// Thumbnail
var from2 = path.join(__dirname, 'fixtures', 'radar_medium.jpg');
var to2 = path.join(local.uploadDir, '2009', 'RxRvKSlbl', 'radar_medium.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from2, to2);

// Database.
db.init(function (dbErr) {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  tools.loadFixture(fixture, function (err) {
    if (err) {
      console.error('Loading sample data failed.');
      console.error(err);
    } else {
      console.log('Sample was loaded successfully.');
    }

    db.close();
  });
});
