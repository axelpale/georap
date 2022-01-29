// ##### FILES AND PATHS #####
// Can be left as default if you do the installation as described in README.
//
const path = require('path');

// Static files
// Express/Webpack will copy the static files to be served to this directory:
exports.staticDir = path.resolve(__dirname, '../.tmp/public');
// URLs of the static files are prefixed with this static URL root path.
// Ensure to remove any trailing slash.
exports.staticUrl = '/assets';

// Uploaded files
// Express will serve uploaded files (location attachments) from this dir.
exports.uploadDir = path.resolve(__dirname, '../.data/uploads');
// URLs of the uploaded files are prefixed with this URL root path.
exports.uploadUrl = '/uploads';
// Thumbnail max width & height in pixels
exports.uploadThumbSize = 568;
// Upload file size limit in bytes.
exports.uploadSizeLimit = 20 * 1024 * 1024; // 20 MiB

// Temporary uploaded files.
// Files under these directories are removed in regular basis.
exports.tempUploadDir = path.resolve(__dirname, '../.data/tempUploads');
// URLs of the temporary files are prefixed with this URL root path.
exports.tempUploadUrl = '/temporary';
// Seconds from last change, after the file or dir can be safely removed.
exports.tempUploadTimeToLive = 2 * 24 * 60 * 60; // two days
// Upload file size limit in bytes.
exports.tempUploadSizeLimit = 200 * 1024 * 1024; // 200 MiB

// Log files
// Logs about requests are stored under this directory:
exports.logDir = path.resolve(__dirname, '../.data/logs');
