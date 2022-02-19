const status = require('http-status-codes');
const pjson = require('../../package.json');
const config = require('georap-config');
const i18n = require('i18n');
const ejs = require('ejs');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const MONTH = 30 * 24 * 60 * 60 * 1000; // ms

// Precompile template and prerender index.html.
// Include config and other variables for the client.
const precompile = function (locale) {

  const p = path.resolve(__dirname, './template.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync
  const template = ejs.compile(f);

  const georap = {
    version: pjson.version,
    config: {
      // Include only configs the client needs
      title: config.title,
      description: config.description,
      defaultLocale: config.defaultLocale,
      availableLocales: config.availableLocales,
      icons: config.icons,
      appleTouchIcons: config.appleTouchIcons,
      defaultMapState: config.defaultMapState,
      loginColor: config.loginColor,
      loginPageSize: config.loginPageSize,
      enableSupportPage: config.enableSupportPage,
      supportButtonTitle: config.supportButtonTitle,
      supportPageContent: config.supportPageContent,
      googleMapsKey: config.googleMapsKey,
      publicProtocol: config.publicProtocol,
      publicHostname: config.publicHostname,
      publicPort: config.publicPort,
      staticUrl: config.staticUrl,
      uploadUrl: config.uploadUrl,
      uploadSizeLimit: config.uploadSizeLimit,
      tempUploadSizeLimit: config.tempUploadSizeLimit,
      // User management
      roles: config.roles,
      defaultRole: config.defaultRole,
      capabilities: config.capabilities,
      // Theme and branding TODO sort
      locationNaming: config.locationNaming,
      locationStatuses: config.locationStatuses,
      locationTypes: config.locationTypes,
      rewards: config.rewards,
      entryFlags: config.entryFlags,
      markerTemplates: config.markerTemplates,
      entries: config.entries,
      comments: config.comments,
      coordinateSystems: config.coordinateSystems,
      exportServices: config.exportServices,
    },
    i18n: {
      locale: locale,
      catalog: i18n.getCatalog(locale),
    },
  };

  // Precompile client-side templates and append their source into HTML.
  const precompiledTemplates = [];

  config.coordinateSystems.forEach((sys) => {
    const sysName = sys[0];
    const sysTemplate = sys[2];
    const sysSource = _.template(sysTemplate).source;

    precompiledTemplates.push({
      name: sysName,
      source: sysSource,
    });
  });

  config.exportServices.forEach((serv) => {
    const servName = serv[0];
    const servTemplate = serv[1];
    const servSource = _.template(servTemplate).source;

    precompiledTemplates.push({
      name: servName,
      source: servSource,
    });
  });

  return template({
    georap: georap,
    templates: precompiledTemplates,
  });
};

// Precompile index page in each locale for fast delivery.
// As a penalty, some memory is used.
const indexHtmls = config.availableLocales.reduce((acc, locale) => {
  acc[locale] = precompile(locale); // html
  return acc;
}, {});

// Serve the client page in a user favoured language.
exports.get = function (req, res) {
  // Find locale and its precompiled page.
  const userLocale = req.getLocale();
  const defaultLocale = config.defaultLocale;
  // Ensure such precomiled indexHmtl exists
  const servedLocale = indexHtmls[userLocale] ? userLocale : defaultLocale;
  const indexHtml = indexHtmls[servedLocale];
  // Send precompiled index page.
  return res
    .status(status.OK)
    .cookie('locale', servedLocale, {
      maxAge: MONTH,
    }) // init user locale if not set
    .send(indexHtml);
};

exports.getManifest = function (req, res) {
  // Construct a web app manifest.
  return res.json({
    'background_color': 'black',
    'description': config.description,
    'display': 'standalone',
    'icons': config.icons.map(icon => {
      return Object.assign({}, icon, {
        src: '/assets/' + icon.src,
      });
    }),
    'name': config.title,
    'start_url': '.',
  });
};
