//
// This is the main configuration file of your Georap instance.
//
// The configuration is split into two sections.
// - CRITICAL CONFIG
// - NON-CRITICAL CONFIG
//
// As the name suggests, you need to go through CRITICAL CONFIG to get
// the site up and running.
//
// Default values in NON-CRITICAL CONFIG are enough to run a site.
// To tailor the app for your team or community, see them through.
// The non-critical config is grouped into submodules under config/ dir.
// They include things like marker icons, location classification,
// user roles and capabilities, and third party map services.
//

// We will join paths relative to the current directory.
const path = require('path');
const icons = require('./icons');
const posts = require('./posts');
const landing = require('./landing');
const locations = require('./locations');
const filesUrls = require('./filesUrls');
const capabilities = require('./capabilities');
const coordinateSystems = require('./coordinateSystems');
const exportServices = require('./exportServices');
const supportPage = require('./supportPage');
const languages = require('./languages');
const security = require('./security');
const users = require('./users');

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
  // for invitation and password reset emails.
  mail: {
    sender: 'admin@example.com',
  },

  // ##### END OF CRITICAL CONFIG #####
  // The default values for the rest of the config are enough to run the site.
  // They still provide powerful ways to modify the look and feel of the site.
  // The config properties are grouped into submodules under config/ dir.
  // You can find detailed documentation of each property in their submodule.
  // Feel encouraged to check them out.

  // Files and paths
  // See config/filesUrls.js
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

  // Users and capabilities
  // See config/users.js
  // See config/capabilities.js
  roles: users.roles,
  defaultRole: users.defaultRole,
  capabilities: capabilities, // New in v14
  rewards: users.rewards,

  // Languages and translations
  // See config/languages.js
  defaultLocale: languages.defaultLocale,
  availableLocales: languages.availableLocales,

  // Site logo in various sizes for different devices and use cases.
  // See config/icons.js
  icons: icons.icons,
  appleTouchIcons: icons.appleTouchIcons,

  // Landing UI conditions
  // See config/landing.js
  defaultMapState: landing.defaultMapState,
  loginPageSize: landing.loginPageSize,
  loginBackground: landing.loginBackground,
  loginColor: landing.loginColor,

  // Locations
  // See config/locations.js
  locationNaming: locations.locationNaming,
  // Location classification and marker styles
  locationStatuses: locations.locationStatuses,
  locationTypes: locations.locationTypes,
  // Location marker template image settings
  markerTemplates: locations.markerTemplates,

  // Posts and comments
  // See config/posts.js
  entries: posts.entries,
  comments: posts.comments,
  entryFlags: posts.entryFlags,

  // Support page for general info and community rules
  // See config/supportPage.js
  enableSupportPage: supportPage.enableSupportPage,
  supportButtonTitle: supportPage.supportButtonTitle,
  supportPageContent: supportPage.supportPageContent,

  // Coordinate systems available for users and export services.
  // See config/coordinateSystems.js
  coordinateSystems: coordinateSystems,
  // External web map services to where users can export coordinates.
  // See config/exportServices.js
  exportServices: exportServices,

  // Security and development
  // See config/security.js
  // Hashing settings
  bcrypt: security.bcrypt,
  // Node environment detection
  env: security.env,
};
