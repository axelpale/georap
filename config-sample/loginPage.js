const path = require('path');

// Login screen mode
exports.loginPageSize = 'full'; // or 'medium' to show the map.
// Login screen background image. The first thing the user experiences.
// The image will be copied to a public location on start up.
// Use only an absolute path.
exports.loginBackground = path.join(__dirname, 'images/login-background.jpg');
// A color scheme for buttons and progress bars on the login page.
// The possible values are the contextual color from Bootstrap 3:
// 'muted', 'primary', 'success', 'info', 'warning', 'danger'
exports.loginColor = 'primary';
