var config = require('tresdb-config');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

// Precompile template and prerender index.html.
var indexHtml = (function precompile() {

  var p = path.resolve(__dirname, './scaffold.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync
  var template = ejs.compile(f);

  return template({
    // Mocked/partial tresdb client-side config
    tresdb: {
      config: {
        staticUrl: config.staticUrl,
        uploadUrl: config.uploadUrl,
        uploadSizeLimit: config.uploadSizeLimit,
        tempUploadSizeLimit: config.tempUploadSizeLimit,
      },
    },
  });
}());

exports.get = function (req, res) {
  return res.send(indexHtml);
};
