// Usage:
//   var story = new Story(entry, locationModel)

var locations = require('../../../../stores/locations');
var makeEntryModel = require('../lib/makeEntryModel');
var assertEntryType = require('../lib/assertEntryType');

var emitter = require('component-emitter');

module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     plain content entry object. Must be exactly the entry in loc.entries
  //     for manipulation to work as expected.
  //   entries
  //     EntriesModel instance. Work as a parent.

  var self = this;
  emitter(self);

  assertEntryType(rawEntry.type, 'location_story');

  makeEntryModel(self, rawEntry, entries);

  self.getMarkdown = function () {
    return rawEntry.data.markdown;
  };

  self.setMarkdown = function (markdown, callback) {
    // Update markdown and save change to backend.
    // Server will emit 'location_story_changed' event.
    var lid = entries.getLocation().getId();
    var eid = self.getId();
    var m = markdown.trim();
    locations.changeStory(lid, eid, m, callback);
  };

  entries.on('location_story_changed', function (ev) {
    if (ev.data.entryId === self.getId()) {
      rawEntry.data.markdown = ev.data.newMarkdown;
      self.emit('location_story_changed');
    }
  });
};
