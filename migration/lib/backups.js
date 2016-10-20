// Backup or restore the database to/from .data/backups/
//

var mongodbBackup = require('mongodb-backup');
var mongodbRestore = require('mongodb-restore');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var local = require('../../config/local');

// Dir name format
var FORMAT = 'YYYY-MM-DDTHH-mm-ss';

var findLatest = function (callback) {
  // Parameters:
  //   callback
  //     function (err, latestName)

  fs.readdir(local.mongo.backupDir, function (err, items) {
    if (err) {
      return callback(err);
    }

    var moms = items.map(function (item) {
      return moment(item, FORMAT);
    });

    var latest = moment.max(moms);

    return callback(null, latest.format(FORMAT));
  });
};

exports.list = function (callback) {
  // List available backups.
  //
  // Parameters:
  //   callback
  //     function (err, namelist)

  fs.readdir(local.mongo.backupDir, callback);
};

exports.backup = function (callback) {
  // Parameters:
  //   callback
  //     function (err, backupName)
  //       Parameters:
  //         err
  //         backupName
  //           name of the backup directory (not path)

  // Root dir name is derived from current time
  var dirname = moment().format(FORMAT);
  var root = path.resolve(local.mongo.backupDir, dirname);

  mongodbBackup({
    uri: local.mongo.url,
    root: root,
    callback: function (err) {
      if (err) {
        return callback(err);
      }  // else

      return callback(null, dirname);
    },
  });
};

exports.restore = function (name, callback) {
  // Parameters
  //   name
  //     optional, name of the dir under local.mongo.backupDir.
  //     If omitted, defaults to latest backup.
  //   callback
  //     function (err, restoredName)
  var cb, p;

  // p = null means that use the latest
  if (typeof name === 'function') {
    cb = name;
    p = null;
  } else {
    if (typeof callback === 'function') {
      cb = callback;
    } else {
      cb = function () {};
    }

    if (typeof name === 'string' && name.length > 0) {
      p = name;
    } else {
      p = null;
    }
  }

  var runRestore = function (dirname) {
    var err;
    var root = path.resolve(local.mongo.backupDir, dirname);

    if (!fs.existsSync(root)) {
      err = new Error('No backups found with the name "' + dirname + '"');
      err.name = 'InvalidBackupName';

      return cb(err);
    }  // else

    mongodbRestore({
      uri: local.mongo.url,
      root: path.resolve(root, 'tresdb'),
      dropCollections: true,
      callback: function (err2) {
        if (err2) {
          return cb(err2);
        }  // else

        return cb(null, dirname);
      },
    });
  };

  if (p === null) {
    findLatest(function (err, latestDirName) {
      if (err) {
        return cb(err);
      }

      return runRestore(latestDirName);
    });
  } else {
    return runRestore(p);
  }
};
