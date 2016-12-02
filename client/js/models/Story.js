// Usage:
//   var story = new Story(entry, locationModel)

var upgradeToEntry = require('./Entry');
var assertEntryType = require('./lib/assertEntryType');

module.exports = function (entry, locationModel) {
  // Parameters:
  //   entry
  //     plain content entry object
  //   locationModel
  //     models.Location instance. Work as a parent of Story.

  assertEntryType(entry.type, 'story');

  upgradeToEntry(this, entry, locationModel);

  this.getMarkdown = function () {
    return entry.data.markdown;
  };

  this.setMarkdown = function (markdown) {
    entry.data.markdown = markdown.trim();
    this.emit('markdown_changed');
  };

};
