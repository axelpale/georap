const path = require('path');

module.exports = {

  // Title and description of the site. Used in many places,
  // including html and emails.
  title: 'My Georap App',
  description: 'A secret geographical portal',

  // Initial map location for new users.
  // Example locations are at @57.5727427,21.8783527,13z
  defaultMapState: {
    lat: 57.5727427,
    lng: 21.8783527,
    zoom: 13,
    mapTypeId: 'hybrid', // 'roadmap', 'satellite', 'hybrid', or 'terrain'
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
  // Georap itself uses only HTTP. However if Georap is running behind
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
    url: 'mongodb://mongouser:mongouserpwd@localhost:27017/georap',
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
  // Comment out types you do not need or add your own.
  // Each type needs a matching png symbol available under
  // directory: config/images/markers/symbols
  // The order of the list defines the button order in symbol pickers.
  locationTypes: [
    'default',
    'castle',
    'military',
    'residental',
    'mansion',
    'building',
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
    'restaurant',
    'movietheatre',
    'leisure',
    'sports',
    'school',
    'hospital',
    'sawmill',
    'mining',
    'workshop',
    'factory',
    'railway',
    'marine',
    'vehicle',
    'roadhouse',
    'aviation',
    'helicopter',
    'firestation',
    'infrastructure',
    'electricity',
    'communications',
    'watermanagement',
    'watchtower',
    'lighthouse',
    'bridge',
    'tunnel',
    'underground',
    'freak',
  ],

  // Rewards.
  // Users earn stars for successful activity.
  // This feature brings a playful game-like element to the service.
  // The rewards are defined here.
  // NOTE flag-based rewards are defined under entryFlags.
  rewards: {
    eventBased: {
      'location_created': 10,
      'location_removed': -10,
      'location_entry_created': 2,
      'location_name_changed': 0,
      'location_geom_changed': 1,
      'location_status_changed': 1,
      'location_type_changed': 1,
      // Legacy events from early installations.
      // They cannot be created anymore yet could not be fully converted.
      // Fresh installations can safely remove these.
      'location_tags_changed': 2, // legacy
      'location_unproved_visit_created': 2, // legacy
    },
    attachmentBased: {
      perAttachment: 3,
      maxAttachmentsToReward: 2,
    },
  },

  // Flags for Entries.
  // Flags are used to classify entries (aka posts) or give them perks.
  // An example of a flag is 'visit' that can denote that the entry is
  // about a visitation on the location instead of just general info.
  // Flags also accumulate to the location of the flagged entry, so
  // that a user can filter locations based on flags in their own entries.
  // For example the 'visit' flag allows a user to browse all locations
  // she has visited.
  entryFlags: {
    visit: {
      name: 'visit',
      plural: 'visits',
      description: 'A photo is required for proof.',
      glyphicon: 'flag',
      reward: 15,
      // Precondition allows a flag to be used only if the entry content
      // fulfills a condition. Entry content consists of
      // entry properties { markdown, attachments, flags }.
      // The condition is represented as JSON schema.
      precondition: {
        type: 'object',
        properties: {
          attachments: {
            type: 'array',
            minItems: 1,
          },
        },
        required: ['attachments'],
      },
    },
  },

  // Marker templates.
  // Marker template is a background image for the marker without a symbol.
  // It determines the shape and color for the combined marker icons.
  // The configuration here is a mapping:
  //   status -> flag -> size -> template_name.
  // where:
  //   status
  //     Location status.
  //   flag
  //     Entry flag. The locations where the user has posted
  //     an entry with a flag will show as markers
  //     built with these templates. For example, locations with entries
  //     flagged as 'visit' can be configured to show in special color
  //     for the user who posted the visits.
  //     Locations where the user has not posted any flagged entries
  //     will use templates configured as 'default' for the given status.
  //   size
  //     There are three sizes: 'sm', 'md', and 'lg'. Emphasized locations
  //     will show up with large markers.
  //   template_name:
  //     A template file name without file extension. You can add or edit
  //     template images at config/images/markers/templates
  //     NOTE template name must contain only lowercase letters and/or
  //     underscores for the server to parse it correctly.
  //
  markerTemplates: {
    'unknown': {
      'default': {
        'sm': 'red_default_sm',
        'md': 'red_default_md',
        'lg': 'red_default_lg',
      },
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
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
      'visit': {
        'sm': 'yellow_default_sm',
        'md': 'yellow_default_md',
        'lg': 'yellow_default_lg',
      },
    },
  },

  // Entry listing
  entries: {
    // Items to load initially and when Load More -button is pressed.
    pageSize: 10,
  },

  // Commenting
  comments: {
    secondsEditable: 360,
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
      '<%= getD(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
      '<%= getD(absLng) %>&nbsp;<%= getLngDir(lng) %>',
    ],
    [
      'WGS84-DM',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      '<%= getDM(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
      '<%= getDM(absLng) %>&nbsp;<%= getLngDir(lng) %>',
    ],
    [
      'WGS84-DMS',
      '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      '<%= getDMS(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
      '<%= getDMS(absLng) %>&nbsp;<%= getLngDir(lng) %>',
    ],
    // For example, the official coordinate system in Finland:
    [
      'ETRS-TM35FIN',
      '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs',
      'N&nbsp;<%= Math.round(lat) %>, E&nbsp;<%= Math.round(lng) %>',
    ],
    [
      'SWEREF99-TM',
      '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs',
      'N&nbsp;<%= Math.round(lat) %>, E&nbsp;<%= Math.round(lng) %>',
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
      '?language=en&params=<%= latitude %>;<%= longitude %>_type:' +
      '<%= (zoom <= 5) ? "country" : ' +
      '    (zoom <= 8) ? "state" : ' +
      '    (zoom <= 10) ? "adm1st" : ' +
      '    (zoom <= 11) ? "adm2nd" : ' +
      '    (zoom <= 12) ? "adm3rd" : ' +
      '    (zoom <= 13) ? "event" : ' +
      '    (zoom <= 14) ? "airport" : "landmark" %>',
      'WGS84',
      [{ // Global
        east: 180,
        north: 90,
        south: -90,
        west: -180,
      }],
    ],
    [
      'Paikkatietoikkuna',
      'http://www.paikkatietoikkuna.fi/web/fi/kartta' +
      '?ver=1.17&' +
      'zoomLevel=<%= Math.max(Math.min(zoom - 6, 13), 0) %>&' +
      'coord=<%= longitude %>_<%= latitude %>&' +
      'mapLayers=base_35+100+default&showMarker=true&showIntro=false',
      'ETRS-TM35FIN',
      [{ // Finland
        east: 32.14,
        north: 70.166,
        south: 59.56,
        west: 18.86,
      }],
    ],
    [
      'Karttapaikka',
      'https://asiointi.maanmittauslaitos.fi/karttapaikka/' +
      '?lang=fi&share=customMarker&' +
      'n=<%= latitude %>&e=<%= longitude %>&' +
      'zoom=<%= Math.max(Math.min(zoom - 6, 13), 0) %>',
      'ETRS-TM35FIN',
      [{ // Finland
        east: 32.14,
        north: 70.166,
        south: 59.56,
        west: 18.86,
      }],
    ],
    [
      'Tampereen karttapalvelu',
      'https://kartat.tampere.fi/oskari/' +
      '?zoomLevel=<%= Math.max(Math.min(zoom - 6, 15), 5) %>&' +
      'coord=<%= longitude %>_<%= latitude %>&' +
      'showMarker=true&showIntro=false',
      'ETRS-TM35FIN',
      [
        { // Northern Pirkanmaa, Finland
          east: 24.178,
          north: 61.869,
          south: 61.556,
          west: 23.691,
        },
        { // Southern Pirkanmaa, Finland
          east: 24.079,
          north: 61.596,
          south: 61.377,
          west: 23.493,
        },
      ],
    ],
    [
      'Museovirasto',
      'https://kartta.museoverkko.fi/' +
      '?zoomLevel=<%= Math.max(Math.min(zoom - 6, 12), 0) %>&' +
      'coord=<%= longitude %>_<%= latitude %>&' +
      'mapLayers=' +
      '17+100+default,' +
      '133+100+Ei%20tunnuksia,' + // Kiinteät muinaisjäännökset, pisteet
      '142+100+Ei%20tunnuksia,' + // Mahdolliset muinaisjäännökset, pisteet
      '136+100+Ei%20tunnuksia,' + // Luonnonmuodostumat, pisteet
      '145+100+Ei%20tunnuksia,' + // Muut kohteet, pisteet
      '139+100+Ei%20tunnuksia,' + // Löytöpaikat, pisteet
      '161+100+Ei%20tunnuksia&' + // Muut kulttuuriperintökohteet, pisteet
      'markers=2|3|ff3334|<%= longitude %>_<%= latitude %>|' +
      '<%= name %>',
      'ETRS-TM35FIN',
      [{ // Finland
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
      'z=<%= Math.max(Math.min(zoom - 4, 15), 0) %>&' +
      'background=1&boundaries=true',
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
      '?lng=<%= longitude %>&lat=<%= latitude %>&' +
      'zoom=<%= Math.max(Math.min(zoom, 21), 4) %>&' +
      'mapType=normaphd',
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
      'z=<%= Math.max(Math.min(zoom, 20), 3) %>&' +
      'l=aerial',
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
    const env = process.env.NODE_ENV;

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
