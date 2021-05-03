
const versions = require('./versions');
const schema = require('./lib/schema');
const loadFixture = require('./lib/loadFixture');
const initialStateFixture = require('./fixtures/initial');
const ensureIndices = require('./ensureIndices');

const initEmptyDatabase = function (callback) {
  console.log('Resetting database...');
  loadFixture(initialStateFixture, (err) => {
    if (err) {
      console.error('Loading initial data failed.');
      return callback(err);
    }

    console.log('Database reset successfully.');
    return callback();
  });
};

const migrationSuccess = function (callback) {
  // Ensure indices
  console.log();
  console.log('##### Building indices #####');

  ensureIndices((err) => {
    if (err) {
      console.log('Index creation FAILED.');
      return callback(err);
    }
    // Success note
    console.log('Indices created successfully.');
    console.log();
    console.log('##### Migration SUCCESS #####');

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
  schema.getVersion((err, currentVersion) => {
    if (err) {
      return callback(err);
    } // else

    if (currentVersion === -1) {
      // Database empty. Init the database.
      console.log('  No schema found. Database is empty.');
      return initEmptyDatabase((errin) => {
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
      console.log('#### Migrating from', currentVersion, 'to',
                  targetVersion, '####');

      versions.run(currentVersion, targetVersion, (err2) => {
        if (err2) {
          console.log();
          console.log('##### Migration FAILED #####');
          console.log('Data might be in a corrupted state.');
          return callback(err2);
        } // else
        return migrationSuccess(callback);
      });
    } else {
      console.log();
      console.log('DB schema versions are already met.');
      return migrationSuccess(callback);
    }
  });
};
