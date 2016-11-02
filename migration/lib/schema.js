// Tools to find out and update the current database schema version.

var pjson = require('../../package.json');
var semver = require('semver');

exports.getDesiredVersion = function () {
  // Return desired version as integer. Equals to package major version.
  return semver.major(pjson.version);
};

exports.getVersion = function (configColl, callback) {
  // Find current schema version.
  //
  // Parameters:
  //   configColl
  //     A MongoDB collection where the schema version is kept.
  //   callback
  //     function (err, version)
  //       Parameters:
  //         err
  //           null if no errors
  //         version
  //           integer

  configColl.findOne({ key: 'schemaVersion' }).then(function (doc) {
    if (doc) {
      return callback(null, doc.value);
    }  // else

    // No schema found. Must be v1.
    return callback(null, 1);
  }).catch(function (err) {
    return callback(err, null);
  });
};

exports.setVersion = function (configColl, version, callback) {
  // Update database schema version.

  configColl.update({ key: 'schemaVersion' }, {
    $set: { value: version },
  }, { upsert: true }).then(function () {
    callback(null);
  }).catch(function (err) {
    callback(err);
  });
};
