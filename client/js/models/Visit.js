// Usage:
//   var visit = new Visit(entry, locationModel)

var upgradeToEntry = require('./Entry');
var assertEntryType = require('./lib/assertEntryType');

module.exports = function (entry, locationModel) {
  // Parameters:
  //   entry
  //     plain content entry object
  //   locationModel
  //     models.Location instance. Work as a parent.

  assertEntryType(entry.type, 'visit');

  upgradeToEntry(this, entry, locationModel);

  this.getYear = function () {
    return entry.data.year;
  };

  this.setYear = function (year) {
    entry.data.year = parseInt(year, 10);
    this.emit('year_changed');
  };
};
