const db = require('georap-db');
const purifyMarkdown = require('purify-markdown');
const _ = require('lodash');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Modify post markdown, attachments, or flags.
  //
  // Parameters:
  //   params:
  //     oldEntry
  //       raw entry object
  //     username
  //       string
  //     locationName
  //       because posts dont store location name but events do
  //     delta
  //       object of changed values
  //   callback
  //     function (err)
  //
  const oldEntry = params.oldEntry;
  const coll = db.collection('entries');
  const q = { _id: oldEntry._id };
  const delta = Object.assign({}, params.delta); // keep original intact

  // Sanitize possible markdown
  if ('markdown' in delta) {
    delta.markdown = purifyMarkdown(delta.markdown).trim();
  }

  // Ensure minimal delta by including only values that differ.
  // This step also ensures that forbidden properties have no effect.
  const minDelta = {};
  const original = {};
  if (delta.markdown !== oldEntry.markdown) {
    minDelta.markdown = delta.markdown;
    original.markdown = oldEntry.markdown;
  }
  if (!_.isEqual(delta.attachments, oldEntry.attachments)) {
    minDelta.attachments = delta.attachments;
    original.attachments = oldEntry.attachments;
  }
  if (!_.isEqual(delta.flags, oldEntry.flags)) {
    minDelta.flags = delta.flags;
    original.flags = oldEntry.flags;
  }

  const changedEntry = Object.assign({}, oldEntry, minDelta);

  coll.replaceOne(q, changedEntry, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      entryId: oldEntry._id,
      locationId: oldEntry.locationId,
      locationName: params.locationName,
      username: params.username,
      delta: minDelta,
      original: original,
    };

    eventsDal.createLocationEntryChanged(eventParams, (everr) => {
      if (everr) {
        return callback(everr);
      }

      return callback(null, changedEntry);
    });
  });
};
