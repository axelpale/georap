
const db = require('georap-db');

exports.getUserForAdmin = function (username, callback) {
  // Fetch an array of users with admin-only information such as email.
  //
  // Parameters:
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

  const coll = db.collection('users');
  const q = { name: username };
  const proj = { hash: false };

  coll.find(q).project(proj).toArray((err, users) => {
    let u;

    if (err) {
      return callback(err);
    }

    if (users && users.length > 0) {
      u = users[0];
      return callback(null, u);
    }

    // not found
    return callback(null, null);
  });

};


exports.setRole = function (username, isAdmin, callback) {
  // Set user role
  //
  // Parameters:
  //   username
  //   isAdmin
  //   callback
  //     function (err)

  if (typeof username !== 'string' || typeof isAdmin !== 'boolean') {
    throw new Error('invalid parameters');
  }

  const coll = db.collection('users');
  const q = { name: username };
  const up = { $set: { 'admin': isAdmin } };

  coll.updateOne(q, up, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};

exports.setStatus = function (username, newStatus, callback) {
  // Set user status
  //
  // Parameters:
  //   username
  //   newStatus
  //     Available values are 'active' | 'deactivated'
  //   callback
  //     function (err)

  if (typeof username !== 'string' || typeof newStatus !== 'string' ||
      (newStatus !== 'active' && newStatus !== 'deactivated')) {
    throw new Error('invalid parameters');
  }

  const coll = db.collection('users');
  const q = { name: username };
  const up = { $set: { 'status': newStatus } };

  coll.updateOne(q, up, (err) => {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};
