// Backup or restore the database to/from .data/backups/ or specified path
//

var mongodbBackup = require('mongodb-backup');
var mongodbRestore = require('mongodb-restore');
var moment = require('moment');
var path = require('path');
var fse = require('fs-extra');
var local = require('tresdb-config');

// Dir name format
var FORMAT = 'YYYY-MM-DDTHH-mm-ss';

var findLatest = function (callback) {
  // Find name of the latest backup.
  //
  // Parameters:
  //   callback
  //     function (err, latestName)

  fse.readdir(local.mongo.backupDir, function (err, items) {
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

exports.getBackupDirPathForName = function (name) {
  // Builds an absolute dir path for a named backup.
  // The resulting path can be used as backupTo(result, ...)
  return path.join(local.mongo.backupDir, name);
};

exports.list = function (callback) {
  // List available backups.
  //
  // Parameters:
  //   callback
  //     function (err, namelist)

  fse.readdir(local.mongo.backupDir, callback);
};

exports.backupTo = function (dirPath, callback) {
  // Stores the database under a directory.
  // The directory must be dedicated for this backup instance only.
  //
  // Parameters:
  //   dirPath
  //     absolute path to existing directory
  //   callback
  //     function (err)
  //
  mongodbBackup({
    uri: local.mongo.url,
    root: dirPath,
    parser: 'bson',
    callback: function (err) {
      if (err) {
        return callback(err);
      }  // else

      return callback(null, dirPath);
    },
  });
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

  exports.backupTo(root, function (err) {
    return callback(err, dirname);
  });
};

exports.restoreFrom = function (dirPath, callback) {
  // Reset database state to the backup at the given directory.
  //
  // Parameters:
  //   dirPath
  //     an absolute path to directory used in backupTo
  //   callback
  //     function (err)
  //
  var root = path.resolve(dirPath, 'tresdb');

  fse.exists(root, function (rootDirExists) {
    var err2;

    if (!rootDirExists) {
      err2 = new Error('No backups found with the path "' + root + '"');
      err2.name = 'InvalidBackupName';

      return callback(err2);
    }  // else

    mongodbRestore({
      uri: local.mongo.url,
      root: root,
      parser: 'bson',
      dropCollections: true,
      callback: function (err3) {
        if (err3) {
          return callback(err3);
        }  // else

        return callback(null, root);
      },
    });
  });
};

exports.restore = function (name, callback) {
  // Parameters
  //   name
  //     optional, name of the dir under local.mongo.backupDir.
  //     If omitted, defaults to latest backup.
  //   callback
  //     function (err, restoredName)
  var cb, p, root;

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

  if (p === null) {

    findLatest(function (err, latestDirName) {
      if (err) {
        return cb(err);
      }

      root = path.resolve(local.mongo.backupDir, latestDirName);

      return exports.restoreFrom(root, cb);
    });

  } else {

    root = path.resolve(local.mongo.backupDir, p);

    return exports.restoreFrom(root, cb);
  }
};

exports.discardFrom = function (dirPath, callback) {
  // Remove the backup stored at the given directory.
  // Will ensure that the directory is a real backup directory.

  fse.readdir(dirPath, function (err, files) {
    if (err) {
      return callback(err);
    }

    if (files.length === 1 && files[0] === 'tresdb') {
      fse.remove(dirPath, callback);
    }
  });
};
