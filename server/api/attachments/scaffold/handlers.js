const config = require('tresdb-config');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Precompile template and prerender index.html.
const indexHtml = (function precompile() {

  const p = path.resolve(__dirname, './template.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync
  const template = ejs.compile(f);

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
