
var versions = require('./versions');
var schema = require('./lib/schema');

exports.migrate = function (targetVersion, callback) {
  // Parameters:
  //   targetVersion
  //     Optional version integer to migrate to. If not specified,
  //     the target version is fetched from the package.json.
  //   callback
  //     function (err)

  // Get desired version
  if (typeof targetVersion === 'function') {
    callback = targetVersion;
    targetVersion = schema.getDesiredVersion();
  }

  if (typeof targetVersion !== 'number') {
    throw new Error('targetVersion must be a number');
  }

  if (typeof callback !== 'function') {
    throw new Error('callback must be a function');
  }

  console.log('##### Migration #####');
  console.log('');

  // Get current version.
  console.log('Checking versions...');
  schema.getVersion(function (err, currentVersion) {
    if (err) {
      return callback(err);
    }  // else

    console.log('  Current DB schema version:', currentVersion);
    console.log('  Desired DB schema version:', targetVersion);

    if (currentVersion < targetVersion) {
      console.log();
      console.log('#### Migrating from', currentVersion, 'to',
                  targetVersion, '####');

      versions.run(currentVersion, targetVersion, function (err2) {

        if (err2) {
          console.log();
          console.log('##### Migration FAILED #####');

          return callback(err2);
        }  // else

        console.log();
        console.log('##### Migration SUCCESS #####');

        return callback();
      });
    } else {
      console.log();
      console.log('DB schema versions are already met.');
      console.log();
      console.log('##### Migration SUCCESS #####');

      return callback();
    }
  });
};
