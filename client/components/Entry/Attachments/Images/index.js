// View for attachment browsing.
var ViewerView = require('./Viewer');
var BrowserView = require('./Browser');
var template = require('./template.ejs');
var ui = require('georap-ui');

module.exports = function (attachments) {

  var children = {};
  var $elems = {};
  var $mount = null;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    if (attachments.length === 0) {
      return; // No need to setup empty viewer
    }

    $mount.html(template({}));

    $elems.viewer = $mount.find('.entry-images-viewer-container');
    $elems.browser = $mount.find('.entry-images-browser-container');

    var selectedImage = attachments[0];

    children.viewer = new ViewerView(selectedImage);
    children.viewer.bind($elems.viewer);

    children.browser = new BrowserView(attachments);
    children.browser.bind($elems.browser);

    children.browser.on('image_selected', function (attachment) {
      children.viewer.update(attachment);
    });
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      ui.offAll($elems);
      $mount = null;
    }
  };
};
