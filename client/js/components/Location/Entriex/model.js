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
