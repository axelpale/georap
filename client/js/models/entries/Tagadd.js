// Usage:
//   var c = new Tagadd(rawEntry, location)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'tagadd');

  makeEntry(this, rawEntry, location);

  this.getTag = function () {
    return rawEntry.data.tag;
  };

};
