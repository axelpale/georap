// Usage:
//   var visit = new Visit(rawEntry, location)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'visit');

  makeEntry(this, rawEntry, location);

  this.getYear = function () {
    return rawEntry.data.year;
  };

  this.setYear = function (year) {
    rawEntry.data.year = parseInt(year, 10);
    this.emit('year_changed');
  };
};
