// Note: this file is used on server side too.

var pointMap = {
  'location_created': 10,
  'location_removed': -10,
  'location_entry_created': 2,
  'location_unproved_visit_created': 2, // legacy
  'location_name_changed': 0,
  'location_geom_changed': 1,
  'location_status_changed': 1,
  'location_type_changed': 1,
  'location_tags_changed': 2, // legacy
};

// Entry attachments
var attachmentReward = 3;
var attachmentLimit = 2;

// Entry flags
var flagRewards = {
  'visit': 15,
};

var getAttachmentsReward = function (attachments) {
  var n = attachments.length;
  return attachmentReward * Math.min(n, attachmentLimit);
};

var getFlagsReward = function (flags) {
  return flags.reduce(function (acc, flag) {
    if (flag in flagRewards) {
      return acc + flagRewards[flag];
    }
    return acc;
  }, 0);
};

module.exports = function (ev) {
  // Return number of scene points from the event.
  //
  var reward = 0;
  var beforeReward, afterReward;

  if (ev.type === 'location_entry_created') {
    reward += pointMap[ev.type];
    reward += getAttachmentsReward(ev.data.entry.attachments);
    reward += getFlagsReward(ev.data.entry.flags);
    return reward;
  }

  if (ev.type === 'location_entry_changed') {
    if ('attachments' in ev.data.original) {
      beforeReward = getAttachmentsReward(ev.data.original.attachments);
      afterReward = getAttachmentsReward(ev.data.delta.attachments);
      reward += afterReward - beforeReward;
    }
    if ('flags' in ev.data.original) {
      beforeReward = getFlagsReward(ev.data.original.flags);
      afterReward = getFlagsReward(ev.data.delta.flags);
      reward += afterReward - beforeReward;
    }
    return reward;
  }

  if (ev.type === 'location_entry_removed') {
    reward -= pointMap['location_entry_created'];
    reward -= getAttachmentsReward(ev.data.entry.attachments);
    reward -= getFlagsReward(ev.data.entry.flags);
    return reward;
  }

  if (pointMap.hasOwnProperty(ev.type)) {
    return pointMap[ev.type];
  }

  return 0;
};
