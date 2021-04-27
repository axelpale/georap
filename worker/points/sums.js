const eventFilters = require('pretty-events');
const getPoints = require('tresdb-points');
const config = require('tresdb-config');

exports.sumPoints = function (evs) {
  // Return sum of points of given events.

  // Filter events. For example, prevent subsequent taggings
  // from accumulating points.
  // TODO aggregate actions per location and give points based on the aggregate
  // instead of independent events.
  const filteredEvs = eventFilters.mergeSimilar(evs);

  return filteredEvs.reduce((acc, ev) => {
    return acc + getPoints(ev);
  }, 0);
};

exports.sumFlags = function (evs) {
  // Flag statistics
  //
  // Parameters
  //   evs
  //     array of events
  //
  // Return
  //   array of flagCount objects
  //     name
  //       flag name
  //     count
  //       integer
  //
  const flagNames = Object.keys(config.entryFlags);
  const initFlagCounts = flagNames.reduce((acc, flagName) => {
    acc[flagName] = 0;
    return acc;
  }, {});

  const flagCounts = evs.reduce((acc, ev) => {
    if (ev.type === 'location_entry_changed') {
      if (ev.data.original.flags) {
        ev.data.original.flags.forEach((flagName) => {
          acc[flagName] -= 1;
        });
      }
      if (ev.data.delta.flags) {
        ev.data.delta.flags.forEach((flagName) => {
          acc[flagName] += 1;
        });
      }
      return acc;
    }
    if (ev.type === 'location_entry_created') {
      ev.data.entry.flags.forEach((flagName) => {
        acc[flagName] += 1;
      });
      return acc;
    }
    if (ev.type === 'location_entry_removed') {
      ev.data.entry.flags.forEach((flagName) => {
        acc[flagName] -= 1;
      });
      return acc;
    }
    return acc;
  }, initFlagCounts);

  // Convert to ordered array
  return flagNames.map((flagName) => {
    const flagConf = config.entryFlags[flagName];
    return {
      name: flagName,
      plural: flagConf.plural,
      glyphicon: flagConf.glyphicon,
      count: flagCounts[flagName],
    };
  });
};

exports.sumCreations = function (evs) {
  return evs.reduce((acc, ev) => {
    if (ev.type === 'location_created') {
      return acc + 1;
    }
    if (ev.type === 'location_removed') {
      return acc - 1;
    }
    return acc;
  }, 0);
};

exports.sumPosts = function (evs) {
  return evs.reduce((acc, ev) => {
    if (ev.type === 'location_entry_created') {
      return acc + 1;
    }
    if (ev.type === 'location_entry_removed') {
      return acc - 1;
    }
    return acc;
  }, 0);
};

exports.sumComments = function (evs) {
  return evs.reduce((acc, ev) => {
    if (ev.type === 'location_entry_comment_created') {
      return acc + 1;
    }
    if (ev.type === 'location_entry_comment_removed') {
      return acc - 1;
    }
    return acc;
  }, 0);
};

exports.sumClassifications = function (evs) {
  return evs.reduce((acc, ev) => {
    if (ev.type === 'location_tags_changed') { // legacy
      return acc + ev.data.newTags.length - ev.data.oldTags.length;
    }
    if (ev.type === 'location_status_changed') {
      return acc + 1;
    }
    if (ev.type === 'location_type_changed') {
      return acc + 1;
    }
    return acc;
  }, 0);
};
