var pjson = require('../../package.json');
var local = require('../../config/local');
var versions = require('../versions');
var schema = require('./schema');
var monk = require('monk');
var semver = require('semver');


exports.migrate = function (callback) {

  // DB
  var db = monk(local.mongo.url);

  // Get desired version
  var targetVersion = semver.major(pjson.version);

  // Do not call callback elsewhere. Call 'then' instead.
  var then = function (err) {
    db.close();

    return callback(err);
  };

  console.log('##### Migration #####');
  console.log('');

  // Get current version.
  console.log('Checking versions...');
  schema.getVersion(db.get('config'), function (err, currentVersion) {
    if (err) {
      return then(err);
    }  // else

    console.log('  Current DB schema version:', currentVersion);
    console.log('  Desired DB schema version:', targetVersion);
    console.log('');

    if (currentVersion < targetVersion) {
      console.log('#### Migrating from', currentVersion, 'to',
                  targetVersion, '####');

      versions.run(db, currentVersion, targetVersion, function (err2) {

        if (err2) {
          console.log();
          console.log('##### Migration FAILED #####');

          return then(err2);
        }  // else

        console.log();
        console.log('##### Migration SUCCESS #####');

        return then();
      });
    } else {
      console.log('DB schema versions are already met.');
      console.log();
      console.log('##### Migration SUCCESS #####');

      return then();
    }
  });
};
