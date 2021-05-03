const db = require('georap-db');
const eventsDal = require('../../events/dal');

exports.getOne = function (username, callback) {
  // Get single user without anything extra. The result does not have
  // the properties hash and email.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user), user === null if no user found

  const usersColl = db.collection('users');
  const proj = {
    hash: false,
    email: false,
  };

  usersColl
    .findOne({ name: username }, { projection: proj })
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

exports.getOneWithEvents = function (username, callback) {
  // Get single user
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //       err null and user null if no user found
  //

  exports.getOne(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    const num = 20;
    const before = (new Date()).toISOString();

    eventsDal.getRecentOfUser(username, num, before, (err2, docs) => {
      if (err2) {
        return callback(err2);
      }

      doc.events = docs;

      return callback(null, doc);
    });

  });
};

exports.getFlags = (username, callback) => {
  // Parameters
  //   username
  //   callback
  //     fn (err, flagsObj) where
  //       flagsObj: loc id -> flags by the user
  //

  db.collection('entries').aggregate([
    {
      $match: {
        user: username,
        deleted: false,
        flags: {
          $ne: [],
        },
      },
    },
    {
      $project: {
        locationId: 1,
        flags: 1,
      },
    },
    {
      // Deconstruct flags
      $unwind: '$flags',
    },
    {
      $group: {
        _id: '$locationId',
        flags: {
          $addToSet: '$flags',
        },
      },
    },
  ]).toArray((err, flags) => {
    if (err) {
      return callback(err);
    }

    const idToFlags = flags.reduce((acc, flag) => {
      acc[flag._id] = flag.flags;
      return acc;
    }, {});

    return callback(null, idToFlags);
  });
};
