// Migrate given location_entry_comment_changed
//
const asyn = require('async');
const db = require('georap-db');

module.exports = (evs, callback) => {
  const newEvs = evs.map((ev) => {
    return Object.assign({}, ev, {
      data: {
        entryId: ev.data.entryId,
        commentId: ev.data.commentId,
        delta: {
          markdown: ev.data.newMessage,
        },
      },
    });
  });

  // Replace each
  asyn.eachSeries(newEvs, (newEv, nextEach) => {
    db.collection('events').replaceOne({
      _id: newEv._id,
    }, newEv, nextEach);
  }, (eachErr) => {
    if (eachErr) {
      return callback(eachErr);
    }

    return callback(null, newEvs);
  });
};
