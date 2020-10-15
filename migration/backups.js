// Backup or restore the database to/from .data/backups/ or specified path
//
var moment = require('moment');
var path = require('path');
var fse = require('fs-extra');
var config = require('tresdb-config');

// Dir name format
var FORMAT = 'YYYY-MM-DDTHH-mm-ss';

var findLatest = function (callback) {
  // Find name of the latest backup.
  //
  // Parameters:
  //   callback
  //     function (err, latestName)

  fse.readdir(config.mongo.backupDir, function (err, items) {
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
  return path.join(config.mongo.backupDir, name);
};

exports.list = function (callback) {
  // List available backups.
  //
  // Parameters:
  //   callback
  //     function (err, namelist)

  fse.readdir(config.mongo.backupDir, callback);
};

exports.backupTo = function (dirPath, callback) {
  // Stores the database under a directory.
  // The directory must be dedicated for this backup instance only.
  //
  // WARNING You must stop mongod (mongo server).
  //   If mongod is running while backing up
  //   the backup might become corrupted.
  //
  // Parameters:
  //   dirPath
  //     absolute path to existing directory
  //   callback
  //     function (err)
  //

  fse.copy(config.mongo.dbDir, dirPath, function (err) {
    if (err) {
      return callback(err);
    }  // else

    return callback(null, dirPath);
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
  var root = path.resolve(config.mongo.backupDir, dirname);

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

  fse.pathExists(dirPath, function (err, dirExists) {
    if (err) {
      return callback(err);
    }

    if (!dirExists) {
      var err2 = new Error('No backups found at the path "' + dirExists + '"');
      err2.name = 'InvalidBackupName';

      return callback(err2);
    }  // else

    fse.copy(dirPath, config.mongo.dbDir, function (err3) {
      if (err3) {
        return callback(err3);
      }  // else

      return callback(null, dirPath);
    });
  });
};

exports.restore = function (name, callback) {
  // Parameters
  //   name
  //     optional, name of the dir under config.mongo.backupDir.
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

      root = path.resolve(config.mongo.backupDir, latestDirName);

      return exports.restoreFrom(root, cb);
    });

  } else {

    root = path.resolve(config.mongo.backupDir, p);

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

    if (files.indexOf('journal') >= 0) {
      fse.remove(dirPath, callback);
    }
  });
};
