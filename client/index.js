// Webpack entry point.
// The client build is described here.

// Styles
require('./css/style.css');

// Favicon
require('!!file-loader?name=[path][name].[ext]!./images/logo/16.png');

// Main menu logo
require('!!file-loader?name=[path][name].[ext]!./images/logo/32.png');

// Logos for app icons. See the handler for webmanifest
require('!!file-loader?name=[path][name].[ext]!./images/logo/64.png');
require('!!file-loader?name=[path][name].[ext]!./images/logo/128.png');
require('!!file-loader?name=[path][name].[ext]!./images/logo/256.png');

// My location graphics
require('!!file-loader?name=[path][name].[ext]!./images/mylocation.png');

// JavaScript
require('./js/index.js');
