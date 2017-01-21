// Usage:
//   var c = new Move(rawEntry, location)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'move');

  makeEntry(this, rawEntry, location);

  this.getOldGeom = function () {
    return rawEntry.data.oldGeom;
  };

  this.getOldLatitude = function () {
    return rawEntry.data.oldGeom.coordinates[1];
  };

  this.getOldLongitude = function () {
    return rawEntry.data.oldGeom.coordinates[0];
  };

  this.getNewGeom = function () {
    return rawEntry.data.newGeom;
  };

};
