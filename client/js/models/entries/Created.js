// Usage:
//   var c = new Created(entry, location)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'created');

  makeEntry(this, rawEntry, location);
};
