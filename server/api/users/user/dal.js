var db = require('../../../services/db');
var eventsDal = require('../../events/dal');

exports.getOne = function (username, callback) {
  // Get single user
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //       err null and user null if no user found
  //

  var usersColl = db.get().collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  usersColl.findOne({ name: username }, proj, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    var num = 10;
    var page = 0;

    eventsDal.getRecentOfUser(username, num, page, function (err2, docs) {
      if (err2) {
        return callback(err2);
      }

      doc.events = docs;
      return callback(null, doc);
    });

  });
};
