// Capability configuration for user roles.
// The white list defines what features user can see and access.
// The role of the user is stored in JWT token the user possess.
//
module.exports = { // New in v14
  'public': [
    'geometry',
    'account-login-form',
    'account-password-reset-request',
  ],
  'invited': [
    'account-signup',
  ],
  'resetter': [
    'account-password-reset',
  ],
  'frozen': [], // not able to login. Is different from 'banned'?
  'reader': [], // able to see content after login but not modify
  'writer': [], // replaces basic?
  'basic': [],
  'moderator': [],
  'admin': [
    'admin',
    'account-auth', // allow login and authentication
    'account-invite',
    'account-edit',
    'attachments-read',
    'attachments-update-any',
    'attachments-update-own',
    'attachments-delete-any',
    'attachments-delete-own',
    'comments-read',
    'comments-create',
    'comments-update-any',
    'comments-update-own',
    'comments-delete-any',
    'comments-delete-own',
    'geometry',
    'locations-read',
    'locations-create',
    'locations-delete-any',
    'locations-delete-own',
    'locations-events',
    'locations-export-all',
    'locations-export-one',
    'locations-import',
    'locations-update-any',
    'locations-update-own',
    'posts-read',
    'posts-create',
    'posts-update-any',
    'posts-update-own',
    'posts-delete-any',
    'posts-delete-own',
    'posts-move-any',
    'posts-move-own',
    'statistics',
    'users',
  ],
};
