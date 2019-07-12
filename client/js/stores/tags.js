// Model for all tags. Maybe data comes from server in the future.

var tags = [
  'active',
  'agricultural',
  'aviation',
  'buried',
  'campfire',
  'demolished',
  'freak',
  'factory',
  'grave',
  'guarded',
  'hospital',
  'infrastructure',
  'lighthouse',
  'leisure',
  'locked',
  'marine',
  'military',
  'mining',
  'museum',
  'natural',
  'railway',
  'residental',
  'sawmill',
  'scientific',
  'shop',
  'spiritual',
  'sports',
  'town',
  'tree',
  'underground',
  'vehicle',
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

exports.tagToSymbolUrl = function (tag) {
  var baseUrl = '/assets/images/markers/symbols/';
  return baseUrl + tag + '.png';
};

exports.getAllTags = function () {
  return tags;
};

exports.getTagsNotIn = function (blacklist) {
  // Get all tags, except the ones on the blacklist.
  return tags.filter(notIn(blacklist));
};

exports.isValidTag = function (tag) {
  // Return
  //   true
  //     if tag is known
  //   false
  //     otherwise
  return (tags.indexOf(tag) > -1);
};
