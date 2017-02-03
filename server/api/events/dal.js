var db = require('../../services/db');

exports.getRecent = function (n, page, callback) {
  // Parameters
  //   n
  //     number of events to return
  //   page
  //     page number. 0 = first page. Return range [n * page, n * (page + 1)[
  //     from the array of all events, ordered by time, most recent first
  //   callback
  //     function (err, events)

  var coll = db.get().collection('events');

  coll.find({}).sort({ time: 1 }).toArray(function (err, docs) {
    if (err) {
      return callback(err);
    }

    return callback(null, docs);
  });
};
