const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const models = require('georap-models');
const urls = require('georap-urls-server');
const config = require('georap-config');

const p = path.resolve(__dirname, './template.ejs');
const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync
const template = ejs.compile(f);

exports.show = (req, res) => {
  // If attachment is not an image
  // redirect to direct download.
  // If attachment is an image
  // render a page with the image.
  // This should make the viewing of
  // the image attachment easier
  // for various mobile users.

  // Json visible in development env.
  const jsonsnippet = JSON
    .stringify(req.attachment, null, 2);

  // Add properties 'url' and 'thumburl'
  const attachment = urls.completeAttachment(req.attachment);

  if (models.attachment.isImage(attachment)) {
    // Render page
    const html = template({
      icons: config.icons,
      attachment: attachment,
      jsonsnippet: jsonsnippet,
      isProduction: config.env === 'production',
    });
    return res.send(html);
  }

  // Redirect to direct viewing / download
  return res.redirect(302, attachment.url);
};
