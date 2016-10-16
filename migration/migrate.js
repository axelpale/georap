
var pjson = require('../package.json');
var schema = require('./lib/schema');
var local = require('../config/local');
var monk = require('monk');
var semver = require('semver');

// DB
var db = monk(local.mongo.url);

// Desired version
var targetVersion = semver.major(pjson.version);

schema.getVersion(db.get('config'), function (err, currentVersion) {
  if (err) {
    throw err;
  }  // else

  console.log('Current DB schema version:', currentVersion);
  console.log('Desired DB schema version:', targetVersion);

  if (currentVersion < targetVersion) {
    console.log('Migration from', currentVersion, 'to',
                targetVersion, 'is needed.');
  } else {
    console.log('Migration successful.');
  }

  return db.close();
});
