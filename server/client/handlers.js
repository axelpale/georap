
var pjson = require('../../package.json');
var local = require('../../config/local');
var ejs = require('ejs');
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
      features: local.features,
      googleMapsKey: local.googleMapsKey,
      uploadUrl: local.uploadUrl,
      uploadSizeLimit: local.uploadSizeLimit,
    },
  };

  return template({ tresdb: tresdb });
}());


exports.get = function (req, res) {
  return res.send(indexHtml);
};
