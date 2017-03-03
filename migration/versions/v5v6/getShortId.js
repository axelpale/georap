
var lid2id = {};

module.exports = function (locId, defaultShortId) {
  // Get shortid for the location. If no exists, use the given default
  // and store it for the next query for the same location.
  var lid = locId.toString();

  if (lid in lid2id) {
    return lid2id[lid];
  }

  lid2id[lid] = defaultShortId;

  return defaultShortId;
};
