
var versions = require('../versions');
var schema = require('./schema');

exports.migrate = function (options) {
  // Parameters:
  //   options
  //     db
  //       monk database instance
  //     targetVersion
  //       Optional version integer to migrate to. If not specified,
  //       the target version is fetched from the package.json.
  //     callback
  //       function (err)
  var db, targetVersion;

  // Database
  db = options.db;

  // Get desired version
  if (options.hasOwnProperty('targetVersion')) {
    if (typeof options.targetVersion !== 'number') {
      throw new Error('targetVersion must be a number');
    }
    targetVersion = options.targetVersion;
  } else {
    targetVersion = schema.getDesiredVersion();
  }

  // Do not call callback elsewhere. Call 'then' instead.
  var then = function (err) {
    return options.callback(err);
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

    if (currentVersion < targetVersion) {
      console.log();
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
      console.log();
      console.log('DB schema versions are already met.');
      console.log();
      console.log('##### Migration SUCCESS #####');

      return then();
    }
  });
};
