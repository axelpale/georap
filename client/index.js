// Webpack entry point.
// The client build is described here.

// Styles
require('./css/style.css');

// Favicon
require('!!file-loader?name=[path][name].[ext]!./images/logo/16.png');

// Main menu logo
require('!!file-loader?name=[path][name].[ext]!./images/logo/32.png');

// Login background
require('!!file-loader?name=[path][name].[ext]!./images/login.jpg');

// My location graphics
require('!!file-loader?name=[path][name].[ext]!./images/mylocation.png');

// JavaScript
require('./js/index.js');
