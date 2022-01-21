// Capability configuration for user roles.
// The white list defines what features user can see and access.
// The role of the user is stored in JWT token the user possess.
//
module.exports = { // New in v14
  'public': [
    'geometry',
    'account-login',
    'account-password-reset-request',
  ],
  'invited': [
    'account-signup',
  ],
  'resetter': [
    'account-password-reset',
  ],
  'frozen': [],
  'basic': [
    'account-edit',
    'comments-read',
    'comments-create',
    'comments-delete-own',
    'geometry',
    'locations',
    'locations-create',
    'locations-delete-own',
    'locations-export-one',
    'locations-import',
    'locations-posts',
    'locations-update',
    'posts',
    'posts-create',
    'statistics',
    'users',
  ],
  'moderator': [
    'locations-events',
  ],
  'admin': [
    'admin',
    'account-invite',
    'account-edit',
    'comments-read',
    'comments-create',
    'comments-delete-own',
    'comments-delete-any',
    'geometry',
    'locations',
    'locations-create',
    'locations-delete-any',
    'locations-delete-own',
    'locations-events',
    'locations-export-all',
    'locations-export-one',
    'locations-import',
    'locations-posts',
    'locations-update',
    'posts',
    'posts-create',
    'statistics',
    'users',
  ],
};
