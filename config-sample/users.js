// User account and management settings.
// See also config/capabilities.js

// Roles that can be assigned to user accounts.
// Note that this is a subset of the full set of roles written in capabilities,
// that include also roles for public user and some temporary roles.
// Order of the roles presented here has meaning:
// - The order is visually respected in user role forms.
// - A user cannot promote others to roles after her own role.
//   E.g. moderator can promote others to moderators but not to admins.
// - A user cannot demote others if they have a role after her own.
//   E.g. moderator can demote other moderators but not admins.
exports.roles = [ // New in v14
  'frozen',
  'reader',
  'writer',
  'moderator',
  'admin',
];

// Default role assigned to invited users
exports.defaultRole = 'reader'; // New in v14

// Rewards.
// Users earn stars for successful activity.
// This feature brings a playful game-like element to the service.
// The rewards are defined here.
// NOTE flag-based rewards are defined under entryFlags.
exports.rewards = {
  eventBased: {
    'location_created': 10,
    'location_removed': -10,
    'location_entry_created': 2,
    'location_name_changed': 0,
    'location_geom_changed': 1,
    'location_status_changed': 1,
    'location_type_changed': 1,
    // Legacy events from early installations.
    // They cannot be created anymore yet could not be fully converted.
    // Fresh installations can safely remove these.
    'location_tags_changed': 2, // legacy
    'location_unproved_visit_created': 2, // legacy
  },
  attachmentBased: {
    perAttachment: 3,
    maxAttachmentsToReward: 2,
  },
};
