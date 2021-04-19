const db = require('tresdb-db');
const proptools = require('georap-prop');
const asyn = require('async');
const io = require('../../../services/io');
const attachmentsDal = require('../../attachments/dal');

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

exports.insertAndEmitMany = (evs, callback) => {
  // Parameters:
  //   evs
  //     array of event objects to be inserted and emitted.
  //   callback
  //     function (err)
  //
  asyn.eachSeries(evs, (ev, then) => {
    exports.insertAndEmit(ev, then);
  }, callback);
};

exports.insertAndCompleteAndEmit = (ev, attachmentProps, callback) => {
  // Insert the event and complete attachments in the given event
  // before emitting and then emit the completed event.
  // Will give the event an _id.
  //
  // Parameters:
  //   ev
  //     event object to insert
  //   attachmentProps
  //     array of strings. Each string is property name or a path to property
  //     of attachment key or keyss in the given event. Examples:
  //       ['data.entry.attachments']
  //       ['data.original.attachments', 'data.delta.attachments']
  //     If the property does not exist, it is skipped.
  //   callback
  //     function (err)
  //

  // Insert the basic version and emit an extended version
  // with complete attachments.
  exports.insertOne(ev, (err, newId) => {
    if (err) {
      return callback(err);
    }

    // Clone and fill id
    const eventForEmit = Object.assign({}, ev, {
      _id: newId,
    });

    // Complete attachments.
    // Convert attachment keys to attachments.
    // This prevents additional attachment requests from clients.
    asyn.eachSeries(attachmentProps, (propPath, next) => {
      const value = proptools.get(eventForEmit, propPath);

      if (!value) {
        // No such property at path
        return next();
      }

      let single = false;
      if (typeof value === 'string') {
        single = true;
      }

      let attachmentKeys = value;
      if (single) {
        attachmentKeys = [value];
      }

      attachmentsDal.getManyComplete(attachmentKeys, (merr, atts) => {
        if (merr) {
          return next(merr);
        }
        if (single) {
          atts = atts[0];
        }
        // Replace
        proptools.set(eventForEmit, propPath, atts);
        return next();
      });
    }, (finalErr) => {
      if (finalErr) {
        return callback(finalErr);
      }

      // Emit the completed version.
      exports.emitOne(eventForEmit);

      // TODO maybe callback earlier, place outside waterfall?
      return callback();
    });
  });
};
