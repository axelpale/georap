var entryModel = require('./Entry/model');
var models = require('tresdb-models');

var forwardEntry = models.forwardOne(entryModel, function (entry, ev) {
  return entry._id === ev.data.entryId;
});

exports.forward = models.forward({
  'location_entry_changed': forwardEntry,
  'location_entry_comment_created': forwardEntry,
  'location_entry_comment_changed': forwardEntry,
  'location_entry_comment_removed': forwardEntry,

  'location_entry_created': function (entries, ev) {
    entries.unshift(ev.data.entry);
  },

  'location_entry_removed': function (entries, ev) {
    models.drop(entries, function (entry) {
      return entry._id === ev.data.entryId;
    });
  },
});

exports.getImageEntries = function (entries) {
  // Return entries with image attachments.
  //
  var i, j, att;
  var entries = [];

  for (i = 0; i < entries.length; i += 1) {
    for (j = 0; j < entries[i].attachments; j += 1) {
      att = entries[i].attachments[j];
      if (att.mimetype.substr(0, HEAD) === 'image/') {
        entries.push(entries[i]);
        break; // break inner loop
      }
    }
  }

  return entries;
};
