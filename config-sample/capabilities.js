// Role-based UI Customisation and Permission Management
// made possible by user roles and their capabilities.
// The white list defines what features user can see and access.
// The role of the user is stored in JWT token the user possess.
//
// See admin role below for brief details for each capability.
//
// Introduced in v14.
//
module.exports = {
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
  // 'banned': [], // same as frozen?
  'frozen': [
    // not able to login
  ],
  'reader': [ // able to see content after login but not modify
    'account-auth',
    'account-update',
    'attachments-read',
    'comments-read',
    'geometry-read',
    'latest-events',
    'latest-locations',
    'latest-posts',
    'locations-read',
    'locations-search',
    'locations-filter',
    'locations-export-one',
    'locations-geometry',
    'locations-places',
    'locations-statustype',
    'locations-thumbnail',
    'map-geolocation',
    'posts-read',
    'users-read',
  ],
  // 'commenter': [], // same as reader but could comment?
  'writer': [
    'account-auth',
    'account-update',
    'attachments-read',
    'attachments-create',
    'attachments-update-own',
    'attachments-delete-own',
    'comments-read',
    'comments-create',
    'comments-update-own',
    'comments-delete-own',
    'geometry-read',
    'latest-events',
    'latest-locations',
    'latest-posts',
    'locations-read',
    'locations-search',
    'locations-filter',
    'locations-create',
    'locations-delete-own',
    'locations-events',
    'locations-export-one',
    'locations-geometry',
    'locations-import',
    'locations-places',
    'locations-statustype',
    'locations-thumbnail',
    'locations-update-any',
    'map-geolocation',
    'posts-read',
    'posts-create',
    'posts-update-own',
    'posts-delete-own',
    'posts-move-own',
    'statistics-read',
    'users-read',
  ],
  'moderator': [
    'account-auth',
    'account-update',
    'admin-users-read',
    'admin-users-invite',
    'admin-users-rerole',
    'attachments-read',
    'attachments-create',
    'attachments-update-any',
    'attachments-delete-any',
    'comments-read',
    'comments-create',
    'comments-update-own',
    'comments-delete-any',
    'geometry-read',
    'latest-events',
    'latest-locations',
    'latest-posts',
    'locations-read',
    'locations-search',
    'locations-filter',
    'locations-create',
    'locations-delete-any',
    'locations-events',
    'locations-export-all',
    'locations-export-one',
    'locations-geometry',
    'locations-import',
    'locations-places',
    'locations-statustype',
    'locations-thumbnail',
    'locations-update-any',
    'map-geolocation',
    'posts-read',
    'posts-create',
    'posts-update-own',
    'posts-delete-any',
    'posts-move-any',
    'statistics-read',
    'users-read',
  ],
  'admin': [
    'account-auth', // allow login and any authentication with username
    'account-update', // change of own email and password
    'admin-users-read', // list users, their emails, and activity
    'admin-users-invite', // send invites to create new users
    'admin-users-rerole', // change user roles and freeze accounts
    'admin-users-delete', // delete user accounts permanently
    'attachments-read', // see post and comment attachments
    'attachments-create', // attach images and files to posts and comments
    'attachments-update-any', // rotate attachments created by anybody
    'attachments-update-own', // rotate attachments created by you
    'attachments-delete-any', // delete attachments created by anybody
    'attachments-delete-own', // delete attachments created by you
    'comments-read', // see comments with the posts
    'comments-create', // write comments to posts
    'comments-update-any', // edit comments by anybody
    'comments-update-own', // edit comments by you
    'comments-delete-any', // delete comments by anybody
    'comments-delete-own', // delete comments by you
    'geometry-read', // access coordinates tool
    'latest-events', // see latest events tab
    'latest-locations', // see latest locations tab
    'latest-posts', // see latest posts tab
    'locations-read', // browse locations on map and access location pages
    'locations-search', // search and list locations
    'locations-filter', // access tools to filter location markers on map
    'locations-create', // create new locations
    'locations-delete-any', // remove locations created by anyone
    'locations-delete-own', // remove locations created by you
    'locations-events', // see the event log on the location page
    'locations-export-all', // export all locations in a single KML file
    'locations-export-one', // export single location in KML or other formats.
    'locations-geometry', // see location coordinates on location page
    'locations-import', // create new locations by importing KML files
    'locations-places', // see automatic geocode on location page
    'locations-statustype', // see location status and type
    'locations-thumbnail', // see location thumbnail
    'locations-update-any', // edit name, type, coords, & thumb of any location
    'locations-update-own', // edit name, ... & thumbnail of your location
    'map-geolocation', // button to see your location on map as a blue dot
    'posts-read', // see posts on location pages
    'posts-create', // write posts to locations
    'posts-update-any', // edit posts written by anybody
    'posts-update-own', // edit posts written by you
    'posts-delete-any', // delete posts written by anybody
    'posts-delete-own', // delete posts written by you
    'posts-move-any', // move posts by anybody onto another location
    'posts-move-own', // move posts by you onto another location
    'statistics-read', // see site statistics such as the number of locations
    'users-read', // list users and see their profile pages
  ],
  // 'dev': [], // for testing and beta features?
};
