var eventFilters = require('pretty-events');
var getPoints = require('../../client/js/components/lib/getPoints');

exports.sumPoints = function (evs) {
  // Return sum of points of given events.

  // Filter events. For example, prevent subsequent taggings
  // from accumulating points.
  var filteredEvs = eventFilters.mergeTagged(evs);

  return filteredEvs.reduce(function (acc, ev) {
    return acc + getPoints(ev);
  }, 0);
};

exports.sumVisits = function (evs) {
  return evs.reduce(function (acc, ev) {
    if (ev.type === 'location_entry_changed') {
      if (ev.data.oldIsVisit === true && ev.data.newIsVisit === false) {
        return acc - 1;
      }
      if (ev.data.oldIsVisit === false && ev.data.newIsVisit === true) {
        return acc + 1;
      }
      return acc;
    }
    if (ev.type === 'location_entry_created') {
      if (ev.data.isVisit === true) {
        return acc + 1;
      }
    }
    if (ev.type === 'location_entry_removed') {
      // No good way to determine if visit or not. Punish the remover.
      return acc - 1;
    }
    return acc;
  }, 0);
};

exports.sumCreations = function (evs) {
  return evs.reduce(function (acc, ev) {
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
  return evs.reduce(function (acc, ev) {
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
  return evs.reduce(function (acc, ev) {
    if (ev.type === 'location_entry_comment_created') {
      return acc + 1;
    }
    if (ev.type === 'location_entry_comment_removed') {
      return acc - 1;
    }
    return acc;
  }, 0);
};

exports.sumTags = function (evs) {
  return evs.reduce(function (acc, ev) {
    if (ev.type === 'location_tags_changed') {
      return acc + ev.data.newTags.length - ev.data.oldTags.length;
    }
    return acc;
  }, 0);
};