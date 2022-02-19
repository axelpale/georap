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
  //
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

      // Complete worker-created properties
      // TODO create props in user creation and fill missing in migrate.
      doc.allTime = doc.allTime ? doc.allTime : 0;
      doc.days365 = doc.days365 ? doc.days365 : 0;
      doc.days30 = doc.days30 ? doc.days30 : 0;
      doc.days7 = doc.days7 ? doc.days7 : 0;
      doc.flagsCreated = doc.flagsCreated ? doc.flagsCreated : [];
      doc.locationsCreated = doc.locationsCreated ? doc.locationsCreated : 0;
      doc.postsCreated = doc.postsCreated ? doc.postsCreated : 0;
      doc.locationsClassified =
        doc.locationsClassified ? doc.locationsClassified : 0;
      doc.commentsCreated = doc.commentsCreated ? doc.commentsCreated : 0;

      return callback(null, doc);
    })
    .catch((err) => {
      return callback(err);
    });
};

exports.getEvents = function (params, callback) {
  // Get events of single user.
  //
  // Parameters:
  //   params
  //     username
  //       string
  //     skip
  //       integer
  //     limit
  //       integer
  //   callback
  //     function (err, user)
  //       err null and user null if no user found
  //
  eventsDal.getRecentOfUser(params, callback);
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
