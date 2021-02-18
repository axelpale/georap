const db = require('tresdb-db');
const io = require('../../../services/io');

exports.emitOne = (ev) => {
  if (!('_id' in ev)) {
    throw new Error('Event must have a _id before emitting');
  }

  io.get().emit('tresdb_event', ev);
};

exports.insertOne = (ev, callback) => {
  // Parameters:
  //   ev
  //     event object to insert
  //   callback
  //     function (err, eventId);
  db.collection('events').insertOne(ev, (err, result) => {
    if (err) {
      return callback(err);
    }
    return callback(null, result.insertedId);
  });
};

exports.insertAndEmit = (ev, callback) => {
  // Parameters:
  //   ev
  //     event object to insert and emit after insertion. Ev is given a _id.
  //   callback
  //     function (err)
  //
  exports.insertOne(ev, (err, newId) => {
    if (err) {
      return callback(err);
    }
    ev._id = newId;
    exports.emitOne(ev);
    return callback(null);
  });
};
