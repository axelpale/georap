// Module for the set of visited location ids

var M = function () {
  this.flags = {};
};

M.prototype.get = function (locId) {
  // Get array of flag strings for location id
  var flags = this.flags[locId];
  if (flags) {
    return flags;
  }
  return [];
};

M.prototype.setAll = function (flagsObj) {
  // Reset all flag data
  this.flags = flagsObj;
};

M.prototype.add = function (locId, newFlags) {
  // Add flags to location id.
  //
  // Parameters:
  //   locId
  //     string, location id
  //   newFlags
  //     array of flag strings to add
  //
  var locFlags = this.flags[locId];

  if (locFlags) {
    // Loc prop exists, add new flags and keep flags unique.
    newFlags.forEach(function (newFlag) {
      if (locFlags.indexOf(newFlag) < 0) {
        locFlags.push(newFlag);
      }
    });
  } else {
    // Loc prop does not exist. Init with a copy of the provided flags.
    // Copy to avoid possible mutations in future.
    this.flags[locId] = newFlags.slice();
  }
};

M.prototype.remove = function (locId, flagsToRemove) {
  // Parameters:
  //   locId
  //     location id
  //   flagsToRemove
  //     optional array of flags to remove. If not given, all flags of the
  //     location are removed.
  //
  // Return
  //   -
  //
  var currentFlags = this.flags[locId];

  if (currentFlags) {
    if (flagsToRemove) {
      // Remove only given flags, not all.
      this.flags[locId] = currentFlags.filter(function (curFlag) {
        // Keep current flags that do not exist in the flagsToRemove
        return flagsToRemove.indexOf(curFlag) < 0;
      });
    } else {
      // Remove all
      delete this.flags[locId];
    }
  }
  // else does not exists, nothing to remove
};

module.exports = M;
