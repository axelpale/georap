var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var template = require('./template.ejs');

module.exports = function (selectedImage, images) {
  // Parameters:
  //   selectedImage
  //     attachment of the current location thumbnail
  //   images
  //     array of attachment objects. Image attachments only.
  //     These will be presented for the user to pick from.
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Initial attachment key
  var selectedKey = selectedImage.key;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      images: images,
    }));

    $mount.on('click', function (ev) {
      if (ev.target.dataset.attachmentKey) {
        selectedKey = ev.target.dataset.attachmentKey;
      }
    });
  };

  self.getSelectedKey = function () {
    return selectedKey;
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
