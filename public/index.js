// Webpack entry point.
// The client build is described here.

// HTML for single-page app
require('file?name=index.html!./index.html');

// Styles
require('./styles/style.css');

// Favicon
require('file?name=images/favicon.png!./images/favicon.png');

// JavaScript
require('./js/index.js');
