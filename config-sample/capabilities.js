// Capability configuration for user roles.
// These define what features user can see and access.
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
    'comments',
    'geometry',
    'locations',
    'posts',
    'statistics',
    'users',
  ],
  'moderator': [],
  'admin': [
    'admin',
    'account-invite',
    'account-edit',
    'comments',
    'geometry',
    'locations',
    'posts',
    'statistics',
    'users',
  ],
};
