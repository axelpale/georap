// Capability configuration for user roles.
// These define what features user can see and access.
// The role of the user is stored in JWT token the user possess.
//
module.exports = { // New in v14
  'public': [
    'geometry',
  ],
  'invited': [
    'account-signup',
  ],
  'frozen': [
    'coordinates',
    'location-read',
  ],
  'basic': [
    'account-read-own',
    'account-change-email-own',
    'account-change-password-own',
    'coordinates',
    'location-read',
    'location-create',
    'location-edit-own',
    'location-delete-own',
    'post-read',
    'post-create',
    'post-edit-own',
    'post-delete-own',
    'comment-read',
    'comment-create',
    'comment-edit-own',
    'comment-delete-own',
    'user-read',
    'search',
    'filter',
    'statistics',
  ],
  'moderator': [],
  'admin': [
    'search',
    'filter',
    'coordinates',
    'location-read',
    'location-create',
    'location-edit-own',
    'location-delete-any',
    'post-read',
    'post-create',
    'post-edit-own',
    'post-delete-any',
    'comment-read',
    'comment-create',
    'comment-edit-own',
    'comment-delete-any',
    'user-read',

    'admin',
    'account-invite',
    'account-edit',
    'statistics',
  ],
};
