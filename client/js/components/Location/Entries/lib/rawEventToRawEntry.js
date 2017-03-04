// Converts following raw events to raw entries
// - location_attachment_created
// - location_story_created
// - location_visit_created
//
var clone = require('clone');

module.exports = function (ev) {
  // Return entry

  var entry = clone(ev);

  // Correct _id
  entry._id = ev.data.entryId;
  delete entry.data.entryId;

  // Entries have a 'deleted' property unlike events
  entry.deleted = false;

  // Correct type. E.g.:
  //   location_visit_created -> location_visit
  entry.type = ev.type.replace('_created', '');

  return entry;
};
