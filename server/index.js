/* eslint-disable max-statements, no-sync */

const config = require('georap-config');
const http = require('http');
const path = require('path');
const fse = require('fs-extra');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);

const io = require('./services/io');
io.init(server);

const mailer = require('./services/mailer');
mailer.init();

const db = require('georap-db');

// Logging
const loggers = require('./services/logs/loggers');

// Internationalization i18n
// The i18n configuration must be done before routes
// because the locale-specific client index page precompilation
// needs it when routes are built.
const i18n = require('i18n');
const catalog = require('../locales');
i18n.configure({
  defaultLocale: config.defaultLocale, // string e.g: 'en'
  // The name of the cookie from to parse locale settings
  cookie: 'locale',
  // The name of the ?locale=en url query parameter
  queryParameter: 'locale',
  // A set of dictionaries.
  staticCatalog: catalog,
});

// Routes
const router = require('./routes');

// Log environment
console.log('Starting Georap in environment:', config.env);


// Database connection first

db.init((dbErr) => {
  if (dbErr) {
    console.error('Failed to connect to MongoDB.');
    console.error(dbErr);
    return;
  }
  // Success
  console.log('Connected to MongoDB...');
});

// Start the server.

server.listen(config.port, () => {
  console.log('Express listening on port ' + config.port + '...');
});


// Security best practices
// -----------------------
// https://expressjs.com/en/advanced/best-practice-security.html

// Do not tell we are using Express.
app.disable('x-powered-by');

// -----------------------
// Security best practices END


// Request logging
// ---------------
if (config.env === 'production') {
  app.use(loggers.http());
}
// ---------------
// Request logging END

// Internationalization i18n
// -------------------------
// Internationalization init recognizes cookie and accept-language header
app.use(cookieParser());
app.use(i18n.init);
// -------------------------
// Internationalization i18n END

// Static assets
// -------------
app.use(config.staticUrl, express.static(config.staticDir));
console.log('Serving static files from', config.staticUrl);
// Instance-specific static files are best copied without webpack
// because webpack does not support dynamic paths well.
const imagesSource = path.resolve(__dirname, '..', 'client', 'images');
const themesSource = path.resolve(__dirname, '..', 'client', 'themes');
const modulesSource = path.resolve(__dirname, '..', 'node_modules');
const bootstrapSource = path.resolve(modulesSource, 'bootstrap', 'dist');
const configSource = path.resolve(__dirname, '..', 'config');
const iconsSource = path.join(configSource, 'images', 'icons');
const markersSource = path.join(configSource, 'images', 'markers');
// Target paths
const imagesTarget = path.join(config.staticDir, 'images');
const bootstrapTarget = path.join(config.staticDir, 'bootstrap');
// Ensure target paths exist
fse.ensureDirSync(imagesTarget);
fse.ensureDirSync(bootstrapTarget);
// Copy
(function copyCustomStatic(copyPaths) {
  copyPaths.forEach((pp) => {
    fse.copy(pp[0], pp[1]);
  });
}([
  [imagesSource, imagesTarget],
  [bootstrapSource, bootstrapTarget],
  [themesSource, path.join(config.staticDir, 'themes')],
  [config.loginBackground, path.join(imagesTarget, 'login.jpg')],
  [iconsSource, path.join(imagesTarget, 'icons')],
  [markersSource, path.join(imagesTarget, 'markers')],
]));
console.log('Copying static files to', config.staticDir);
// -------------
// Static assets END


// Uploaded files
// --------------
app.use(config.uploadUrl, express.static(config.uploadDir));
console.log('Serving uploaded files from', config.uploadUrl);
app.use(config.tempUploadUrl, express.static(config.tempUploadDir));
console.log('Serving temporary files from', config.tempUploadUrl);
// --------------
// Uploaded files END


// Server HTTP routes here after static asset routing.
app.use('/', router);

// Socket.io routing
io.get().on('connection', () => {
  // Parameters:
  //   socket
  loggers.log('New connection.');
});

// Override default error handler with a custom one to include date time.
app.use((err, req, res, next) => {
  // Fall back to Express default error handler if error occurs during
  // streaming. https://expressjs.com/en/guide/error-handling.html
  if (res.headersSent) {
    return next(err);
  }

  const datetime = (new Date()).toISOString();
  const logEntry = datetime + ': ' + err.stack;

  console.error(logEntry);
  const INTERNAL_SERVER_ERROR = 500;
  res.status(INTERNAL_SERVER_ERROR).send('Error: ' + err.message);
});
