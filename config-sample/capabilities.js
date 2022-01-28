// Role-based UI Customisation and Permission Management
// made possible by user roles and their capabilities.
// The white list defines what features user can see and access.
// The role of the user is stored in JWT token the user possess.
//
module.exports = { // New in v14
  'public': [
    'geometry-read',
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
  'reader': [ // able to see content after login but not modify
    'account-auth',
    'account-update',
    'attachments-read',
    'comments-read',
    'geometry-read',
    'locations-read',
    'locations-export-one',
    'posts-read',
    'users-read',
  ],
  'writer': [], // replaces basic?
  'basic': [],
  'moderator': [],
  'admin': [
    'account-auth', // allow login and any authentication with username
    'account-update',
    'admin-users-read',
    'admin-users-invite',
    'attachments-read',
    'attachments-create',
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
    'geometry-read',
    'locations-read',
    'locations-create',
    'locations-delete-any',
    'locations-delete-own',
    'locations-events',
    'locations-export-all',
    'locations-export-one',
    'locations-geometry',
    'locations-import',
    'locations-places',
    'locations-statustype',
    'locations-thumbnail',
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
    'statistics-read',
    'users-read',
  ],
  'dev': [], // raw code views and beta features?
};
