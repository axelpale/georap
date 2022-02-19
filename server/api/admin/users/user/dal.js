const config = require('georap-config');
const db = require('georap-db');

exports.getUserForAdmin = function (username, callback) {
  // Fetch an array of users with admin-only information such as email.
  // The result does not have the property 'hash'.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, userObj)
  //       Parameters:
  //         err
  //         userObj
  //           null if not found

  // Assert
  if (typeof username !== 'string' || typeof callback !== 'function') {
    throw new Error('invalid parameters');
  }

  const q = { name: username };
  const proj = { hash: false };

  db.collection('users')
    .findOne(q, { projection: proj })
    .then((doc) => {
      if (!doc) {
        return callback(null, null);
      }
      return callback(null, doc);
    })
    .catch((err) => {
      return callback(err);
    });
};


exports.setRole = function (username, newRole, callback) {
  // Set user role
  //
  // Parameters:
  //   username
  //   newRole
  //   callback
  //     function (err)

  if (typeof username !== 'string' || typeof newRole !== 'string') {
    throw new Error('invalid parameters');
  }

  if (!config.roles.includes(newRole)) {
    throw new Error('invalid role: ' + newRole);
  }

  const coll = db.collection('users');
  const q = { name: username };
  const up = { $set: { 'role': newRole } };

  coll.updateOne(q, up, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};


exports.removeOne = function (username, callback) {
  if (typeof username !== 'string') {
    throw new Error('invalid parameters');
  }

  const coll = db.collection('users');
  const q = { name: username };
  const up = { $set: { 'deleted': true } };

  coll.updateOne(q, up, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};
