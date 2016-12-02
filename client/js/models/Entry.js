// Abstract Entry initializer
//
// Usage:
//   var MyEntry = function (entry, locationModel) {
//     Entry(this, entry, locationModel);
//     ...
//   };
//

var Emitter = require('component-emitter');

module.exports = function (context, entry, locationModel) {
  // Parameters:
  //   context
  //     the "this" context of the inheriting object
  //   entry
  //     plain content entry object
  //   locationModel
  //     models.Location instance. Work as a parent of the entry.

  Emitter(this);

  this.getId = function () {
    return entry._id;
  };

  this.getType = function () {
    return entry.type;
  };

  this.getTime = function () {
    return entry.time;
  };

  this.getUserName = function () {
    return entry.user;
  };

  this.getLocation = function () {
    // Return models.Location instance
    return locationModel;
  };
};
