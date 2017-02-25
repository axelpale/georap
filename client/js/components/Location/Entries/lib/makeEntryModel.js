// Abstract Entry model initializer
//
// Usage:
//   var MyEntry = function (rawEntry, entries) {
//     makeEntry(this, rawEntry, entries);
//     ...
//   };
//

var emitter = require('component-emitter');

module.exports = function (context, rawEntry, entries) {
  // Parameters:
  //   context
  //     the "this" context of the inheriting object
  //   rawEntry
  //     plain content entry object
  //   entries
  //     EntriesModel instance. Work as a parent of the entry.

  if (typeof rawEntry !== 'object') {
    throw new Error('Missing or invalid rawEntry object.');
  }

  if (typeof entries !== 'object') {
    throw new Error('Missing or invalid entries model.');
  }

  emitter(context);

  context.getId = function () {
    return rawEntry._id;
  };

  context.getType = function () {
    return rawEntry.type;
  };

  context.getTime = function () {
    return rawEntry.time;
  };

  context.getUserName = function () {
    return rawEntry.user;
  };

  context.getLocation = function () {
    // Return models.Location instance
    return entries.getLocation();
  };
};
