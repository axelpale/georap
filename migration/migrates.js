
var versions = require('./versions');
var schema = require('./lib/schema');
var backups = require('./backups');
var loadFixture = require('./lib/loadFixture');
var initialStateFixture = require('./fixtures/initial');

var BACKUP_DIR = backups.getBackupDirPathForName('migration');

var cleanup = function (callback) {
  // Clean up after a migration process.
  console.log('Discarding the backup files...');
  backups.discardFrom(BACKUP_DIR, function (errdi) {
    if (errdi) {
      console.log('FAILED to discard backup files.');
      console.error(errdi);
    } else {
      console.log('Backup files discarded successfully.');
    }
    return callback();
  });
};

var initEmptyDatabase = function (callback) {
  console.log('Resetting database...');
  loadFixture(initialStateFixture, function (err) {
    if (err) {
      console.error('Loading initial data failed.');
      return callback(err);
    }

    console.log('Database reset successfully.');
    return callback();
  });
};

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
  console.log('Checking schema version...');
  schema.getVersion(function (err, currentVersion) {
    if (err) {
      return callback(err);
    } // else

    if (currentVersion === -1) {
      // Database empty. Init the database.
      console.log('  No schema found. Database is empty.');
      return initEmptyDatabase(function (errin) {
        if (errin) {
          console.log('#### Migration FAILED ####');
          return callback(errin);
        }
        console.log('#### Migration SUCCESS ####');
        return callback();
      });
    }

    console.log('  Current DB schema version:', currentVersion);
    console.log('  Desired DB schema version:', targetVersion);

    if (currentVersion < targetVersion) {
      console.log();
      console.log('#### Backing up the database ####');
      console.log('If migration fails, the original db state is restored.');

      backups.backupTo(BACKUP_DIR, function (errb) {
        if (errb) {
          console.log();
          console.log('FAILED to back up the database. Stopping...');
          return callback(errb);
        }

        console.log('Database stored to', BACKUP_DIR);
        console.log('Ready for migration.');
        console.log();
        console.log('#### Migrating from', currentVersion, 'to',
                    targetVersion, '####');

        versions.run(currentVersion, targetVersion, function (err2) {
          if (err2) {
            console.log();
            console.log('##### Migration FAILED #####');
            console.log('Data might be in a corrupted state.');
            console.log('Restore the database by:');
            console.log('  npm run migrate:rollback');
            return callback(err2);
          } // else

          console.log();
          console.log('##### Migration SUCCESS #####');

          cleanup(function () {
            return callback();
          });
        });
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
