/* eslint-disable no-magic-numbers */

var path = require('path');

// First, we ensure that local.js is not accidentally included in
// client code, even in the weird case that the path module is available.
if (typeof window !== 'undefined') {
  throw new Error('Local.js leaked into client-side code.');
}

module.exports = {

  // Title of the site
  title: 'My TresDB App',

  // Enable or disable features of the site.
  // See also client/config.js for duplicate configs.
  features: {
    // Set false to hide payments page and payments admin page.
    payments: false,
  },

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // Used to encrypt and decrypt passwords and tokens.
  secret: '123456789',

  // Google Maps API key. CHANGE! Required for e.g. reverse geocoding.
  googleMapsKey: '123456789012345678901234567890123456789',

  // Static files
  // Express/Webpack will copy the static files to be served to this directory:
  staticDir: path.resolve(__dirname, '../.tmp/public'),
  // URLs of the static files are prefixed with this static URL root path:
  staticUrl: '/assets',

  // Uploaded files
  // Express will serve uploaded files (location attachments) from this dir.
  uploadDir: path.resolve(__dirname, '../.data/uploads'),
  // URLs of the uploaded files are prefixed with this URL root path.
  // If you change the uploadUrl, edit also client/config.js.
  uploadUrl: '/uploads',
  // Thumbnail max width & height in pixels
  uploadThumbSize: 568,
  // Upload file size limit in bytes.
  uploadSizeLimit: 20 * 1024 * 1024,

  // Log files
  // Logs about requests are stored under this directory:
  logDir: path.resolve(__dirname, '../.data/logs'),

  // HTTPS
  // TresDB itself uses only HTTP. However if TresDB is running behind
  // a TLS-endpoint reverse-proxy like Nginx, the protocol appears to be
  // HTTPS for the users. Hyperlinks in emails such as invites and password
  // resets should then use HTTPS instead HTTP.
  // By setting publicProtocol property to 'https' instead 'http', HTTPS
  // is used in the links instead HTTP.
  publicProtocol: 'https',

  // Port for server to listen
  port: 3000,

  // Default admin user
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '1234',
  },

  // Mongo database settings
  mongo: {
    url: 'mongodb://foouser:barword@localhost:27017/tresdb',
    testUrl: 'mongodb://foouser:barword@localhost:27017/test',
    backupDir: path.resolve(__dirname, '../.data/backups/'),
  },

  // Email server connection
  // For details, see https://nodemailer.com/2-0-0-beta/setup-smtp/.
  smtp: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'exampleuser',
      pass: 'examplepass',
    },
  },
  // Email messages
  mail: {
    sender: 'admin@example.com',
  },

  // Register coordinate systems to be used.
  // These coordinate systems will be displayed on the location page.
  // These systems are also available for exportServices.
  //
  // Each entry has the form:
  //   [<cordinate system name>, <proj4 projection definition>, <template fn>]
  // Where:
  //   coordinate system name
  //     String.
  //   proj4 projection definition
  //     See http://proj4js.org/ for projection definitions.
  //   template
  //     String. The pretty print of coodinates in EJS templating language.
  //     See available template variables and functions below.
  //
  // Template variables:
  //   lat
  //     Latitude
  //   lng
  //     Longitude
  //   absLat
  //     Math.abs(lat)
  //   absLng
  //     Math.abs(lng)
  //
  // Template functions:
  //   getLatDir(degrees)
  //     Cardinal direction for latitude.
  //     Returns 'N' or 'S'
  //   getLngDir(degrees)
  //     Cardinal direction for longitude.
  //     Returns 'W' or 'E'
  //   getD(degrees)
  //     Decimal degrees
  //     For example: 12.345678°
  //   getDM(degrees)
  //     Degrees minutes.
  //     For example: 12° 34.5678"
  //   getDMS(degrees)
  //     Degrees minutes seconds format.
  //     For example: 12° 34" 56.78'
  //
  coordinateSystems: [
    [
      'WGS84',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      '<%= getD(absLat) %> <%= getLatDir(lat) %>, ' +
      '<%= getD(absLng) %> <%= getLngDir(lng) %>',
    ],
    [
      'WGS84-DM',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      '<%= getDM(absLat) %> <%= getLatDir(lat) %>, ' +
      '<%= getDM(absLng) %> <%= getLngDir(lng) %>',
    ],
    [
      'WGS84-DMS',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      '<%= getDMS(absLat) %> <%= getLatDir(lat) %>, ' +
      '<%= getDMS(absLng) %> <%= getLngDir(lng) %>',
    ],
    // For example, the official coordinate system in Finland:
    [
      'ETRS-TM35FIN',
      '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs',
      'N <%= lat %>, E <%= lng %>',
    ],
  ],

  // Register location export services here.
  // With these, user can inspect the location on other online maps.
  //
  // Each entry has the form:
  //   [<service name>, <url pattern>, <coordinate system name>]
  // Where:
  //   service name
  //     String.
  //   url pattern
  //     String. URL to the service in EJS templating language.
  //     See available template variables below.
  //   coord system
  //     String. Name of the coordinate system to use for variables.
  //
  // Variables available in URL pattern:
  //   latitude
  //   longitude
  //
  exportServices: [
    [
      'GeoHack',
      'https://tools.wmflabs.org/geohack/geohack.php' +
      '?language=en&params=<%= latitude %>;<%= longitude %>_type:landmark',
      'WGS84',
    ],
    [
      'Paikkatietoikkuna',
      'http://www.paikkatietoikkuna.fi/web/fi/kartta' +
      '?ver=1.17&zoomLevel=8&coord=<%= longitude %>_<%= latitude %>&' +
      'mapLayers=base_35+100+default&showMarker=true',
      'ETRS-TM35FIN',
    ],
  ],

  // Bcrypt hashing strength
  bcrypt: {
    rounds: 10,
  },

  // Node environment.
  // Defaults to 'development' like app.get('env') in Express.
  // Access process.env only in one place, here.
  // See https://github.com/eslint/eslint/issues/657
  env: (function () {
    // eslint-disable-next-line no-process-env
    var env = process.env.NODE_ENV;

    if (env === 'production' || env === 'development' || env === 'test') {
      return env;
    }  // else

    return 'development';
  }()),
};
