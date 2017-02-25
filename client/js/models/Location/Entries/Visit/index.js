// Usage:
//   var visit = new Visit(rawEntry, location)

var makeEntryModel = require('../lib/makeEntryModel');
var assertEntryType = require('../lib/assertEntryType');

var emitter = require('component-emitter');

module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   entries
  //     EntriesModel instance. Work as a parent.

  var self = this;
  emitter(self);

  assertEntryType(rawEntry.type, 'location_visit');

  makeEntryModel(self, rawEntry, entries);

  self.getYear = function () {
    return rawEntry.data.year;
  };
};
