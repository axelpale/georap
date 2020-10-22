
var pjson = require('../../package.json');
var config = require('tresdb-config');
var ejs = require('ejs');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

// Precompile template and prerender index.html.
// Include config and other variables for the client.
var indexHtml = (function precompile() {

  var p = path.resolve(__dirname, './template.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync
  var template = ejs.compile(f);

  var tresdb = {
    version: pjson.version,
    config: {
      title: config.title,
      description: config.description,
      defaultMapState: config.defaultMapState,
      supportButtonTitle: config.supportButtonTitle,
      supportPageContent: config.supportPageContent,
      features: config.features,
      googleMapsKey: config.googleMapsKey,
      staticUrl: config.staticUrl,
      uploadUrl: config.uploadUrl,
      uploadSizeLimit: config.uploadSizeLimit,
      tempUploadSizeLimit: config.tempUploadSizeLimit,
      locationStatuses: config.locationStatuses,
      locationTypes: config.locationTypes,
      markerTemplates: config.markerTemplates,
      comments: config.comments,
      coordinateSystems: config.coordinateSystems,
      exportServices: config.exportServices,
    },
  };

  // Precompile client-side templates and append their source into HTML.
  var precompiledTemplates = [];

  config.coordinateSystems.forEach(function (sys) {
    var sysName = sys[0];
    var sysTemplate = sys[2];
    var sysSource = _.template(sysTemplate).source;

    precompiledTemplates.push({
      name: sysName,
      source: sysSource,
    });
  });

  config.exportServices.forEach(function (serv) {
    var servName = serv[0];
    var servTemplate = serv[1];
    var servSource = _.template(servTemplate).source;

    precompiledTemplates.push({
      name: servName,
      source: servSource,
    });
  });

  return template({
    tresdb: tresdb,
    templates: precompiledTemplates,
  });
}());


exports.get = function (req, res) {
  return res.send(indexHtml);
};

exports.getManifest = function (req, res) {
  return res.json({
    'background_color': 'black',
    'description': config.description,
    'display': 'standalone',
    'icons': [
      {
        'src': 'assets/images/logo/64.png',
        'sizes': '64x64',
        'type': 'image/png',
      },
      {
        'src': 'assets/images/logo/128.png',
        'sizes': '128x128',
        'type': 'image/png',
      },
      {
        'src': 'assets/images/logo/256.png',
        'sizes': '256x256',
        'type': 'image/png',
      },
    ],
    'name': config.title,
    'start_url': '.',
  });
};
