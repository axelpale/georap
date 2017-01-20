// Usage:
//   var visit = new Visit(rawEntry, location)

var emitter = require('component-emitter');
var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  emitter(this);
  var self = this;

  assertEntryType(rawEntry.type, 'visit');

  makeEntry(this, rawEntry, location);

  this.getYear = function () {
    return rawEntry.data.year;
  };

  this.setYear = function (year, callback) {
    // Change year and store to backend
    //
    // Parameters:
    //   year
    //     integer
    rawEntry.data.year = year;

    location.save(function (err) {
      if (err) {
        return callback(err);
      }
      self.emit('year_changed');
      return callback();
    });
  };
};
