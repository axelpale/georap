// NOTE this file is used both on client and server side.

var getAttachmentsReward = function (config, attachments) {
  var n = attachments.length;
  var per = config.rewards.attachmentBased.perAttachment;
  var max = config.rewards.attachmentBased.maxAttachmentsToReward;
  return per * Math.min(n, max);
};

var getFlagsReward = function (config, flags) {
  return flags.reduce(function (acc, flagName) {
    if (flagName in config.entryFlags) {
      return acc + config.entryFlags[flagName].reward;
    }
    return acc;
  }, 0);
};

module.exports = function (config, ev) {
  // Return number of scene points from the event.
  //
  // Parameters
  //   config
  //     full project config object with rewards configured.
  //   ev
  //     event object
  //
  var reward = 0;
  var beforeReward, afterReward;
  var type = ev.type;
  var data = ev.data;
  var eventRewards = config.rewards.eventBased;

  if (type === 'location_entry_created') {
    reward += eventRewards[type];
    reward += getAttachmentsReward(config, data.entry.attachments);
    reward += getFlagsReward(config, data.entry.flags);
    return reward;
  }

  if (type === 'location_entry_changed') {
    if ('attachments' in data.original) {
      beforeReward = getAttachmentsReward(config, data.original.attachments);
      afterReward = getAttachmentsReward(config, data.delta.attachments);
      reward += afterReward - beforeReward;
    }
    if ('flags' in data.original) {
      beforeReward = getFlagsReward(config, data.original.flags);
      afterReward = getFlagsReward(config, data.delta.flags);
      reward += afterReward - beforeReward;
    }
    return reward;
  }

  if (type === 'location_entry_removed') {
    reward -= eventRewards['location_entry_created'];
    reward -= getAttachmentsReward(config, data.entry.attachments);
    reward -= getFlagsReward(config, data.entry.flags);
    return reward;
  }

  if (type in eventRewards) {
    return eventRewards[type];
  }

  return 0;
};
