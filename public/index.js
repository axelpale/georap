// Webpack entry point.
// The client build is described here.

// HTML for single-page app
// require('file?name=index.html!./index.html');
// Note: this is commented out because index.html is already served by
// the catch-all route handler to provide index.html to whatever URL
// is requested (because the further routing is done on client side).

// Styles
require('./styles/style.css');

// Favicon
require('file?name=images/logo/16.png!./images/logo/16.png');

// Logo
require('file?name=images/logo/32.png!./images/logo/32.png');

// JavaScript
require('./js/index.js');
