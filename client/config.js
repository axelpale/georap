// This config files exposes local configurations to a client without
// exposing secrets and other stuff.
//
// Downside: some values are duplicates to config/local.js

module.exports = {
  // Url prefix for uploaded files.
  // If you change this, edit also config/local.js
  uploadUrl: '/uploads',
};
