// Usage:
//   var story = new Story(entry, locationModel)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object. Must be exactly the entry in loc.content
  //     for save to work.
  //   location
  //     models.Location instance. Work as a parent of Story.

  assertEntryType(rawEntry.type, 'story');

  makeEntry(this, rawEntry, location);

  this.getMarkdown = function () {
    return rawEntry.data.markdown;
  };

  this.setMarkdown = function (markdown, callback) {
    rawEntry.data.markdown = markdown.trim();
    location.save(function (err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  };

};
