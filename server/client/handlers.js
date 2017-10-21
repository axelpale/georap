
var pjson = require('../../package.json');
var local = require('../../config/local');
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
      title: local.title,
      description: local.description,
      features: local.features,
      googleMapsKey: local.googleMapsKey,
      uploadUrl: local.uploadUrl,
      uploadSizeLimit: local.uploadSizeLimit,
      tempUploadSizeLimit: local.tempUploadSizeLimit,
      coordinateSystems: local.coordinateSystems,
      exportServices: local.exportServices,
    },
  };

  // Precompile client-side templates and append their source into HTML.
  var precompiledTemplates = [];

  local.coordinateSystems.forEach(function (sys) {
    var sysName = sys[0];
    var sysTemplate = sys[2];
    var sysSource = _.template(sysTemplate).source;

    precompiledTemplates.push({
      name: sysName,
      source: sysSource,
    });
  });

  local.exportServices.forEach(function (serv) {
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
