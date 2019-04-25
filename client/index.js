// Webpack entry point.
// The client build is described here.

// Styles
require('./css/style.css');

// Favicon
require('!!file-loader?name=[path][name].[ext]!./images/logo/16.png');

// Main menu logo
require('!!file-loader?name=[path][name].[ext]!./images/logo/32.png');

// Login background
// eslint-disable-next-line max-len
require('!!file-loader?name=images/login.jpg!../config/images/login-background.jpg');

// My location graphics
require('!!file-loader?name=[path][name].[ext]!./images/mylocation.png');

// JavaScript
require('./js/index.js');
