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
const icons = require('./icons');
const posts = require('./posts');
const locations = require('./locations');
const filesUrls = require('./filesUrls');
const loginPage = require('./loginPage');
const capabilities = require('./capabilities');
const coordinateSystems = require('./coordinateSystems');
const exportServices = require('./exportServices');
const security = require('./security');

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
  staticDir: filesUrls.staticDir,
  staticUrl: filesUrls.staticUrl,
  uploadDir: filesUrls.uploadDir,
  uploadUrl: filesUrls.uploadUrl,
  uploadThumbSize: filesUrls.uploadThumbSize,
  uploadSizeLimit: filesUrls.uploadSizeLimit,
  tempUploadDir: filesUrls.tempUploadDir,
  tempUploadUrl: filesUrls.tempUploadUrl,
  tempUploadTimeToLive: filesUrls.tempUploadTimeToLive,
  tempUploadSizeLimit: filesUrls.tempUploadSizeLimit,
  logDir: filesUrls.logDir,

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
  icons: icons.icons,
  appleTouchIcons: icons.appleTouchIcons,

  // Login screen settings
  loginPageSize: loginPage.loginPageSize,
  loginBackground: loginPage.loginBackground,
  loginColor: loginPage.loginColor,

  // Location classification: status and type
  locationStatuses: locations.locationStatuses,
  locationTypes: locations.locationTypes,
  // Location marker template image settings
  markerTemplates: locations.markerTemplates,

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

  // Post list view settings
  entries: posts.entries,
  // Commenting
  comments: posts.comments,
  // Posts can be flagged for example as visits or questions.
  entryFlags: posts.entryFlags,

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
  bcrypt: security.bcrypt,

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
