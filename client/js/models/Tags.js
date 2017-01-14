// Model for all tags. Maybe data comes from server in the future.

module.exports = function () {

  var tags = [
    'cave',
    'church',
    'lighthouse',
    'military',
    'mining',
    'nature',
    'sawmill',
    'underground',
    'walk-in',
  ];

  var notIn = function (list) {
    // Create a function to test if an item is not in the list.
    return function (item) {
      if (list.indexOf(item) > -1) {
        // Item found in list
        return false;
      }
      return true;
    };
  };

  // Public methods

  this.getAllTags = function () {
    return tags;
  };

  this.getTagsNotIn = function (blacklist) {
    // Get all tags, except the ones on the blacklist.
    return tags.filter(notIn(blacklist));
  };

  this.isValidTag = function (tag) {
    // Return
    //   true
    //     if tag is known
    //   false
    //     otherwise
    return (tags.indexOf(tag) > -1);
  };
};
