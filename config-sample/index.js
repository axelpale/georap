/* eslint-disable no-magic-numbers */

var path = require('path');

module.exports = {

  // Title and description of the site. Used in many places,
  // including html and emails.
  title: 'My TresDB App',
  description: 'A secret geographical portal',

  // Initial viewport location. Initial sample locations are here.
  // Default map state. At Irbene, the default samples' loc.
  // @57.5727427,21.8783527,13z
  defaultMapState: {
    lat: 57.5727427,
    lng: 21.8783527,
    zoom: 13,
    // 'hybrid' is darker and more practical than 'roadmap'
    mapTypeId: 'hybrid',
  },

  supportButtonTitle: 'Support us',
  supportPageContent: 'Support us by <insert support method here>',

  // Login screen background image. The first thing the user experiences.
  // The image will be copied to a public location on start up.
  // Use only an absolute path.
  loginBackground: path.join(__dirname, 'images/login-background.jpg'),

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // Used to encrypt and decrypt passwords and tokens.
  secret: '123456789',

  // Google Maps API key. CHANGE! Required for e.g. reverse geocoding.
  googleMapsKey: '123456789012345678901234567890123456789',

  // Static files
  // Express/Webpack will copy the static files to be served to this directory:
  staticDir: path.resolve(__dirname, '../.tmp/public'),
  // URLs of the static files are prefixed with this static URL root path.
  // Ensure to remove any trailing slash.
  staticUrl: '/assets',

  // Uploaded files
  // Express will serve uploaded files (location attachments) from this dir.
  uploadDir: path.resolve(__dirname, '../.data/uploads'),
  // URLs of the uploaded files are prefixed with this URL root path.
  uploadUrl: '/uploads',
  // Thumbnail max width & height in pixels
  uploadThumbSize: 568,
  // Upload file size limit in bytes.
  uploadSizeLimit: 20 * 1024 * 1024, // 20 MiB

  // Temporary uploaded files.
  // Files under these directories are removed in regular basis.
  tempUploadDir: path.resolve(__dirname, '../.data/tempUploads'),
  // URLs of the temporary files are prefixed with this URL root path.
  tempUploadUrl: '/temporary',
  // Seconds from last change, after the file or dir can be safely removed.
  tempUploadTimeToLive: 2 * 24 * 60 * 60, // two days
  // Upload file size limit in bytes.
  tempUploadSizeLimit: 200 * 1024 * 1024, // 200 MiB

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
    // Main database for persistent data.
    url: 'mongodb://mongouser:mongouserpwd@localhost:27017/tresdb',
    // Database for testing and development. You may leave it null.
    testUrl: 'mongodb://testuser:testuserpwd@localhost:27017/test',
  },

  // Email server connection
  // For details, see https://nodemailer.com/2-0-0-beta/setup-smtp/.
  smtp: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'mailboxuser',
      pass: 'mailboxpassword',
    },
  },
  // Email messages
  mail: {
    sender: 'admin@example.com',
  },

  // Location classification: status.
  // The first in the list is used as the default.
  // The list order defines the button order on the location page.
  locationStatuses: [
    'unknown',
    'active',
    'guarded',
    'locked',
    'abandoned',
    'ruined',
    'buried',
    'demolished',
    'natural',
  ],

  // Location classification: type
  // They need to have matching png symbols available
  // under config/images/markers/symbols
  // The list order defines the button order on the location page.
  locationTypes: [
    'default',
    'castle',
    'military',
    'residental',
    'town',
    'agricultural',
    'farm',
    'camp',
    'natural',
    'water',
    'tree',
    'rock',
    'crater',
    'grave',
    'church',
    'spiritual',
    'scientific',
    'nuclear',
    'museum',
    'shop',
    'leisure',
    'sports',
    'school',
    'hospital',
    'sawmill',
    'mining',
    'factory',
    'railway',
    'marine',
    'vehicle',
    'aviation',
    'helicopter',
    'infrastructure',
    'electricity',
    'communications',
    'watermanagement',
    'lighthouse',
    'bridge',
    'tunnel',
    'underground',
    'freak',
  ],

  // Marker templates.
  // A mapping: status -> marking -> size -> template name without ext
  // You can add or edit the templates at config/images/markers/templates
  // NOTE template name must contain only lowercase letters and/or underscores
  // NOTE for the server to parse it correctly.
  markerTemplates: {
    'unknown': {
      'default': {
        'sm': 'red_default_sm',
        'md': 'red_default_md',
        'lg': 'red_default_lg',
      },
      'visited': {
        'sm': 'yellow_default_sm',
        'md': 'yellow_default_md',
        'lg': 'yellow_default_lg',
      },
    },
    'active': {
      'default': {
        'sm': 'red_light_sm',
        'md': 'red_light_md',
        'lg': 'red_light_lg',
      },
      'visited': {
        'sm': 'yellow_light_sm',
        'md': 'yellow_light_md',
        'lg': 'yellow_light_lg',
      },
    },
    'guarded': {
      'default': {
        'sm': 'red_light_sm',
        'md': 'red_light_md',
        'lg': 'red_light_lg',
      },
      'visited': {
        'sm': 'yellow_light_sm',
        'md': 'yellow_light_md',
        'lg': 'yellow_light_lg',
      },
    },
    'locked': {
      'default': {
        'sm': 'red_light_sm',
        'md': 'red_light_md',
        'lg': 'red_light_lg',
      },
      'visited': {
        'sm': 'yellow_light_sm',
        'md': 'yellow_light_md',
        'lg': 'yellow_light_lg',
      },
    },
    'abandoned': {
      'default': {
        'sm': 'red_default_sm',
        'md': 'red_default_md',
        'lg': 'red_default_lg',
      },
      'visited': {
        'sm': 'yellow_default_sm',
        'md': 'yellow_default_md',
        'lg': 'yellow_default_lg',
      },
    },
    'ruined': {
      'default': {
        'sm': 'red_dark_sm',
        'md': 'red_dark_md',
        'lg': 'red_dark_lg',
      },
      'visited': {
        'sm': 'yellow_dark_sm',
        'md': 'yellow_dark_md',
        'lg': 'yellow_dark_lg',
      },
    },
    'buried': {
      'default': {
        'sm': 'red_darker_sm',
        'md': 'red_darker_md',
        'lg': 'red_darker_lg',
      },
      'visited': {
        'sm': 'yellow_darker_sm',
        'md': 'yellow_darker_md',
        'lg': 'yellow_darker_lg',
      },
    },
    'demolished': {
      'default': {
        'sm': 'red_darker_sm',
        'md': 'red_darker_md',
        'lg': 'red_darker_lg',
      },
      'visited': {
        'sm': 'yellow_darker_sm',
        'md': 'yellow_darker_md',
        'lg': 'yellow_darker_lg',
      },
    },
    'natural': {
      'default': {
        'sm': 'red_default_sm',
        'md': 'red_default_md',
        'lg': 'red_default_lg',
      },
      'visited': {
        'sm': 'yellow_default_sm',
        'md': 'yellow_default_md',
        'lg': 'yellow_default_lg',
      },
    },
  },

  // Commenting
  comments: {
    minMessageLength: 2,
    maxMessageLength: 600,
  },

  // Register coordinate systems to be used.
  // These coordinate systems will be displayed on the location page.
  // These systems are also available for exportServices.
  //
  // Each entry has the form:
  //   [<cordinate system name>, <proj4 projection definition>, <template fn>]
  // Where:
  //   coordinate system name
  //     String. Visible to user.
  //   proj4 projection definition
  //     See https://epsg.io/ and for proj4js projection definitions
  //     and http://proj4js.org/ for syntax details.
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
    [
      'SWEREF99-TM',
      '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs',
      'N <%= Math.round(lat) %>, E <%= Math.round(lng) %>',
    ],
  ],

  // Register location export services here.
  // With these, user can inspect the location on other online maps.
  //
  // Each entry has the form:
  //   [<service name>, <url pattern>, <coordinate system name>, <bounds>]
  // Where:
  //   service name
  //     String.
  //   url pattern
  //     String. URL to the service in EJS templating language.
  //     See available template variables below.
  //   coord system
  //     String. Name of the coordinate system to use for variables.
  //   bounds
  //     Array of LatLngBoundsLiteral, areas where the service is available.
  //     Is an array of objects with properties east, north, south, west.
  //     Elements are equivalent to LatLngBoundsLiteral of Google Maps JS API.
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
      [{
        east: 180,
        north: 90,
        south: -90,
        west: -180,
      }],
    ],
    [
      'Paikkatietoikkuna',
      'http://www.paikkatietoikkuna.fi/web/fi/kartta' +
      '?ver=1.17&zoomLevel=8&coord=<%= longitude %>_<%= latitude %>&' +
      'mapLayers=base_35+100+default&showMarker=true',
      'ETRS-TM35FIN',
      [{
        east: 32.14,
        north: 70.166,
        south: 59.56,
        west: 18.86,
      }],
    ],
    [
      'Lantmäteriet',
      'https://minkarta.lantmateriet.se/' +
      '?e=<%= longitude %>&n=<%= latitude %>&' +
      'z=12&background=1&boundaries=true',
      'SWEREF99-TM',
      [
        { // Northern Sweden
          east: 24.17,
          north: 69.07,
          south: 63.07,
          west: 11.74,
        },
        { // Southern Sweden
          east: 19.89,
          north: 63.07,
          south: 54.96,
          west: 10.03,
        },
      ],
    ],
    [
      'Finn.no',
      'https://kart.finn.no/' +
      '?lng=<%= longitude %>&lat=<%= latitude %>' +
      '&zoom=12&mapType=normaphd',
      'WGS84',
      [
        { // Northern Norway
          east: 31.84,
          north: 71.40,
          south: 68.30,
          west: 16.30,
        },
        { // Mid North Norway
          west: 12.08,
          south: 67.31,
          east: 20.92,
          north: 69.70,
        },
        { // Mid South Norway
          west: 10.28,
          south: 63.55,
          east: 16.875,
          north: 67.44,
        },
        { // Southern Norway
          west: 3.03,
          south: 57.63,
          east: 13.45,
          north: 64.26,
        },
      ],
    ],
    [
      'Gule Sider',
      'https://kart.gulesider.no/' +
      '?c=<%= latitude %>,<%= longitude %>&' +
      'z=14&l=aerial',
      'WGS84',
      [
        { // Northern Norway
          east: 31.84,
          north: 71.40,
          south: 68.30,
          west: 16.30,
        },
        { // Mid North Norway
          west: 12.08,
          south: 67.31,
          east: 20.92,
          north: 69.70,
        },
        { // Mid South Norway
          west: 10.28,
          south: 63.55,
          east: 16.875,
          north: 67.44,
        },
        { // Southern Norway
          west: 3.03,
          south: 57.63,
          east: 13.45,
          north: 64.26,
        },
      ],
    ],
  ],

  // Bcrypt hashing strength
  bcrypt: {
    rounds: 10,
  },

  // Set node environment.
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

  // EXPERIMENTAL FEATURES
  // Enable or disable features of the site.
  features: {
    // no configurable features yet
  },
};
