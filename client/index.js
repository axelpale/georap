// Webpack entry point.
// The client build is described here.

// HTML for single-page app
// require('file?name=index.html!./index.html');
// Note: this is commented out because index.html is already served by
// the catch-all route handler to provide index.html to whatever URL
// is requested (because the further routing is done on client side).

// Styles
require('./css/style.css');

// Favicon
require('./images/logo/16.png');

// Main menu logo
require('./images/logo/32.png');

// Login background
require('./images/login.jpg');

// Custom markers
require('./images/mapicons/marker.png');
require('./images/mapicons/geolocation.png');
require('./images/mapicons/additionMarker.png');

// JavaScript
require('./js/index.js');
