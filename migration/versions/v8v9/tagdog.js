const config = require('georap-config');

const has = function (arr, el) {
  return arr.indexOf(el) >= 0;
};

exports.splitTags = function (tags) {
  // Separate tags list into two lists: statuses and types.
  const statuses = [];
  const types = [];
  tags.forEach((tag) => {
    if (has(config.locationStatuses, tag)) {
      statuses.push(tag);
    }
    if (has(config.locationTypes, tag)) {
      types.push(tag);
    }
    // NOTE the legacy type 'natural' exists in both statuses and types
    // and therefore will cause both status and type to become 'natural'.
  });
  return {
    statuses: statuses,
    types: types,
  };
};

exports.tagsToStatusType = function (tags) {
  // Return { status, type }

  // Init with defaults
  const result = {
    status: config.locationStatuses[0],
    type: config.locationTypes[0],
  };

  // Split
  const splitted = exports.splitTags(tags);

  // Test if empty and if not, pick first
  if (splitted.statuses.length > 0) {
    result.status = splitted.statuses[0];
  }
  if (splitted.types.length > 0) {
    result.type = splitted.types[0];
  }

  return result;
};

exports.tagsDiffForEvent = function () {
  // NOTE we probably do not need to convert location_tags_changed event.
  // Let it be. Just begin to use location_status_changed and type_changed
  // from now on. Do not mess with the history if not absolutely necessary.
};

exports.upgradeLegacyTag = function (tag) {
  if (tag === 'walk-in') {
    return 'abandoned';
  }
  if (tag === 'campfire') {
    return 'camp';
  }
  return tag;
};
