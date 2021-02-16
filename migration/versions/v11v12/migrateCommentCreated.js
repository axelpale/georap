// Migrate given location_entry_comment_created
//
const asyn = require('async');
const db = require('tresdb-db');

module.exports = (evs, callback) => {
  const newEvs = evs.map((ev) => {
    const atts = ev.data.attachments ? ev.data.attachments : [];
    return Object.assign({}, ev, {
      data: {
        entryId: ev.data.entryId,
        commentId: ev.data.commentId, // for consistency
        comment: {
          id: ev.data.commentId,
          time: ev.time,
          user: ev.user,
          markdown: ev.data.message,
          attachments: atts,
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
