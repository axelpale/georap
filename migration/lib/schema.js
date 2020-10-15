// Tools to find out and update the current database schema version.

var pjson = require('../../package.json');
var db = require('tresdb-db');
var semver = require('semver');

exports.getDesiredVersion = function () {
  // Return desired version as integer. Equals to package major version.
  return semver.major(pjson.version);
};

exports.getVersion = function (callback) {
  // Find current schema version.
  //
  // Parameters:
  //   callback
  //     function (err, version)
  //       Parameters:
  //         err
  //           null if no errors
  //         version
  //           integer, -1 if no schema found.

  var configColl = db.collection('config');

  configColl.findOne({ key: 'schemaVersion' }, function (err, doc) {
    if (err) {
      return callback(err, null);
    }

    if (doc) {
      return callback(null, doc.value);
    }  // else

    // No schema found. Schema v1 had no config. Test for v1 by users.
    db.collection('users').findOne({}, function (errr, userdoc) {
      if (errr) {
        return callback(errr);
      }

      if (userdoc) {
        return callback(null, 1);
      }

      // No schema found and no user found. We must conclude that
      // the db is empty.
      return callback(null, -1);
    });
  });
};

exports.setVersion = function (version, callback) {
  // Update database schema version.

  var configColl = db.collection('config');

  configColl.update({ key: 'schemaVersion' }, {
    $set: { value: version },
  }, { upsert: true }).then(function () {
    return callback(null);
  }).catch(function (err) {
    return callback(err);
  });
};
