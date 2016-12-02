// Usage:
//   var c = new Rename(entry, locationModel)

var upgradeToEntry = require('./Entry');
var assertEntryType = require('./lib/assertEntryType');

module.exports = function (entry, locationModel) {
  // Parameters:
  //   entry
  //     plain content entry object
  //   locationModel
  //     models.Location instance. Work as a parent.

  assertEntryType(entry.type, 'rename');

  upgradeToEntry(this, entry, locationModel);
};
