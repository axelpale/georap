var db = require('../../../services/db');

// List of user ids. Null before initialization.
var _blacklist = null;

var _create = function (callback) {
  // Create the blacklist into db
  db.collection('config').insertOne({
    key: 'blacklist',
    value: [],
  }, function (err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    if (result.insertedCount === 1) {
      // Init also
      _blacklist = [];

      return callback();
    }  // else

    var unknownError = new Error('blacklist creation failed');
    return callback(unknownError);
  });
};


var _init = function (callback) {

  // Load blacklist from db.
  var q = { key: 'blacklist' };
  db.collection('config').findOne(q, function (err, blist) {
    if (err) {
      return callback(err);
    }

    if (blist) {
      _blacklist = blist.value;
      return callback();
    }

    return _create(callback);
  });
};


var _ensureInit = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  if (_blacklist === null) {
    return _init(callback);
  }
  return callback();
};

var _set = function (blist, callback) {

  if (!Array.isArray(blist)) {
    throw new Error('invalid blacklist to store');
  }

  var q = { key: 'blacklist' };
  var up = {
    $set: { value: blist },
  };

  db.collection('config').updateOne(q, up, function (err) {
    if (err) {
      return callback(err);
    }

    // Success
    return callback();
  });
};


exports.has = function (username, callback) {

  // Init blacklist if not initialized yet.
  _ensureInit(function (err) {
    if (err) {
      return callback(err, null);
    }

    // Return true if user in the blacklist.
    if (_blacklist.indexOf(username) > -1) {
      // User on blacklist
      return callback(null, true);
    }

    return callback(null, false);
  });

};


exports.set = function (username, isBlacklisted, callback) {
  // Add or remove a user from the blacklist.
  //
  // To add a user to blacklist:
  //   blacklist.set('fucker', true, function (err) ...);
  //
  // To remove a user from blacklist or ensure that the user is not b.listed:
  //   blacklist.set('goodguy', false, function (err) ...);
  //
  // Parameters:
  //   username
  //   isBlacklisted
  //     true to blacklist user
  //     false to remove user from blacklist
  //   callback
  //     function (err)

  // Assert
  if (typeof username !== 'string' ||
      typeof isBlacklisted !== 'boolean' ||
      typeof callback !== 'function') {
    throw new Error('invalid blacklist.set parameters');
  }

  // Note: has calls _ensureInit so we do not need to duplicate _ensureInit
  //       call here.
  exports.has(username, function (err, isCurrentlyBlacklisted) {
    if (err) {
      return callback(err);
    }

    if ((isBlacklisted && isCurrentlyBlacklisted) ||
        (!isBlacklisted && !isCurrentlyBlacklisted)) {
      // No need to do anything.
      return callback();
    }

    if (isBlacklisted) {
      // Add to list
      _blacklist.push(username);
    } else {
      // Remove from list
      _blacklist.splice(_blacklist.indexOf(username), 1);
    }

    return _set(_blacklist, callback);
  });
};
