//
// This is the main configuration file of your Georap instance.
//
// The configuration is split in three sections:
// - CRITICAL CONFIG
// - FILES AND PATHS
// - THEME AND BRAND
// - FOR DEVS ONLY
//
// As the name suggests, you need to go through CRITICAL CONFIG to get
// the site up and running.
//
// For custom installation paths and directory structure,
// read and update FILES AND PATHS.
//
// To tailor the app for your team or community, see THEME AND BRAND.
// Theming config includes settings such as available marker icons,
// location classification, list lengths, coordinate systems, and
// third party map services.
//
// Leave the FOR DEVS ONLY as is unless you know what you are doing.
//

// We will join paths relative to the current directory.
const path = require('path');
const capabilities = require('./capabilities');
const coordinateSystems = require('./coordinateSystems');
const exportServices = require('./exportServices');

module.exports = {
  // ##### CRITICAL CONFIG #####

  // Title and description of the site. Used in many places,
  // including html and emails.
  title: 'My Georap App',
  description: 'A geographical community',

  // The admin user credentials.
  // The admin user will be created in the first migration.
  // The admin user cannot be reroled, banned, or deleted.
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '1234',
  },

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // The secret is used to encrypt and decrypt passwords and tokens.
  // To generate random strings: https://www.random.org/strings/
  secret: '123456789',

  // Google Maps API key. CHANGE! Required for e.g. reverse geocoding.
  googleMapsKey: '123456789012345678901234567890123456789',

  // HTTPS
  // Georap itself uses only HTTP. However if Georap is running behind
  // a TLS-endpoint reverse-proxy like Nginx, the protocol is HTTPS
  // from the user perspective.
  // Hyperlinks in emails such as invites and password resets
  // respect the publicProtocol setting.
  // By setting publicProtocol property to 'https' instead 'http', HTTPS
  // is used in the links instead HTTP.
  publicProtocol: 'https',

  // Public hostname.
  // The domain that serves your georap app from the clients' perspective.
  // Do not include protocol prefix or any trailing slashes.
  // The hostname is needed when rendering email messages that
  // contain URLs back to the application.
  // An invitation with a link is an example of such message.
  // Introduced in v13.
  publicHostname: 'mysite.example.com',
  // Public port, the port from the clients' perspective.
  publicPort: 3000, // default public port for http is 80 and for https 443

  // Port for the server to listen.
  // Note that if your app is behind a reverse proxy such as load balancer
  // this is not the public port but the local port that is visible only
  // for the reverse proxy.
  port: 3000,

  // Mongo database settings
  mongo: {
    // Main database for persistent data.
    url: 'mongodb://mongouser:mongouserpwd@localhost:27017/georap',
    // Optional database for testing and development. Uncomment if needed.
    // testUrl: 'mongodb://testuser:testuserpwd@localhost:27017/test',
  },

  // Email
  // Mail server connection settings
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
  // Automatic email message settings
  mail: {
    sender: 'admin@example.com',
  },


  // ##### FILES AND PATHS #####
  // Can be left as default if you do the installation as described in README.

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


  //##### USER MANAGEMENT #####
  roles: ['frozen', 'reader', 'writer', 'moderator', 'admin'], // New in v14
  defaultRole: 'reader', // New in v14
  capabilities: capabilities, // New in v14


  // ##### THEME AND BRAND #####
  // Settings from here to the end of the file can be left default.

  // Languages and translations
  defaultLocale: 'en',
  availableLocales: ['en', 'fi'],

  // Initial map location for new users.
  // Example locations are at @57.5727427,21.8783527,13z
  defaultMapState: {
    lat: 57.5727427,
    lng: 21.8783527,
    zoom: 13,
    mapTypeId: 'hybrid', // 'roadmap', 'satellite', 'hybrid', or 'terrain'
  },

  // Site logo in various sizes for different devices and use cases.
  // The logo will be visible as a favicon in browser tabs, a menu icon,
  // and a desktop icon when user saves the site as an app shortcut.
  // The src paths are relative to the config/ dir and cannot contain '..'.
  // The object structure here is similar to web app manifests.
  // New in v12.1.0.
  icons: [
    {
      'src': 'images/icons/16.png',
      'sizes': '16x16',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/32.png',
      'sizes': '32x32',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/96.png',
      'sizes': '96x96',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/128.png',
      'sizes': '128x128',
      'type': 'image/png',
    },
  ],
  appleTouchIcons: [
    {
      'src': 'images/icons/57.png',
      'sizes': '57x57',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/72.png',
      'sizes': '72x72',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/114.png',
      'sizes': '114x114',
      'type': 'image/png',
    },
    {
      'src': 'images/icons/144.png',
      'sizes': '144x144',
      'type': 'image/png',
    },
  ],

  // Login screen mode
  loginPageSize: 'full', // or 'medium' to show the map.
  // Login screen background image. The first thing the user experiences.
  // The image will be copied to a public location on start up.
  // Use only an absolute path.
  loginBackground: path.join(__dirname, 'images/login-background.jpg'),
  // A color scheme for buttons and progress bars on the login page.
  // The possible values are the contextual color from Bootstrap 3:
  // 'muted', 'primary', 'success', 'info', 'warning', 'danger'
  loginColor: 'primary',

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
    'parking',
    'natural',
    'bird',
    'water',
    'beach',
    'tree',
    'rock',
    'crater',
    'grave',
    'church',
    'spiritual',
    'scientific',
    'nuclear',
    'museum',
    'info',
    'private',
    'shop',
    'restaurant',
    'movietheatre',
    'leisure',
    'canoe',
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
    'bridgesmall',
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

  // Flags for Posts.
  // Flags are used to classify posts (aka entries) or give them perks.
  // An example of a flag is 'visit' that can denote that the post is
  // about a visitation on the location instead of just general info.
  // Flags also accumulate to the location of the flagged post, so
  // that a user can filter locations based on flags in their own posts.
  // For example the 'visit' flag allows a user to browse all locations
  // she has visited.
  // Translation of flags: to display flags in different languages
  // the name and description of the flag are in fact translation keys.
  // Because the flags are customized by you, Georap cannot know translations
  // for them automatically. For that, you must give translations for the keys
  // in the custom locales under config/locales.
  entryFlags: {
    visit: {
      name: 'visit', // a translation key
      genitive: 'visit-genitive', // a translation key
      plural: 'visit-plural', // a translation key
      description: 'visit-description', // a translation key
      glyphicon: 'flag',
      reward: 15,
      // Precondition allows a flag to be used only if the post content
      // fulfills a condition. Post content consists of
      // the post properties { markdown, attachments, flags }.
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
  //     Post flag. The locations where the user has created
  //     a post with a flag will show as markers
  //     built with these templates. For example, locations with posts
  //     flagged as 'visit' can be configured to show in special color
  //     for the user who created the visits.
  //     Locations where the user has not created any flagged posts
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

  // Post list view settings
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

  // Support page
  // A custom html page aimed for community rules and
  // ways to support the community or maintenance.
  // The page can be opened from a main menu button next to the log out.
  enableSupportPage: true,
  supportButtonTitle: 'Support us',
  // supportPageContent can have any static html content
  supportPageContent: 'Support us by <insert support method here>',

  // Coordinate systems available for users and export services.
  // See config/coordinateSystems.js for details.
  coordinateSystems: coordinateSystems,

  // External web map services where users can look alternative maps.
  exportServices: exportServices,


  // ##### FOR DEVS ONLY #####
  // Hashing security and environment variables.
  // Leave these as they are unless you know what you are doing.

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
};
