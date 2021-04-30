/* eslint-disable no-sync */

// Load the example dataset to the database.
// WARNING Deletes the current database and uploads.
//
// Usage
//   npm run migrate:example
//  OR
//   node migration/loadExample.js

const config = require('georap-config');
const fixture = require('./fixtures/example');
const loadFixture = require('./lib/loadFixture');

const db = require('tresdb-db');
const fse = require('fs-extra');
const path = require('path');

// Files.
// Clear uploadDir before new files.
fse.emptyDirSync(config.uploadDir);
// Copy in uploaded-like files.
const from = path.join(__dirname, 'fixtures', 'uploads', 'radar.jpg');
const to = path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from, to);
// Thumbnail
const from2 = path.join(__dirname, 'fixtures', 'uploads', 'radar_medium.jpg');
const to2 =
  path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar_medium.jpg');
// eslint-disable-next-line no-sync
fse.copySync(from2, to2);

// Database.
db.init((dbErr) => {
  if (dbErr) {
    return console.error('Failed to connect to MongoDB.');
  }

  loadFixture(fixture, (err) => {
    if (err) {
      console.error('Loading sample data failed.');
      console.error(err);
    } else {
      console.log('Sample was loaded successfully.');
    }

    db.close();
  });
});
