// Webpack entry point.
// The client build is described here.

// HTML for single-page app
require('file?name=index.html!./index.html');

// Styles
require('./styles/style.css');

// Favicon
require('file?name=images/logo/16.png!./images/logo/16.png');

// Logo
require('file?name=images/logo/32.png!./images/logo/32.png');

// JavaScript
require('./js/index.js');
