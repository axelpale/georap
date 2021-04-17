var emitter = require('component-emitter');
var uic = require('georap-components');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var Thumbnail = uic.Thumbnail;

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

    $elems.palette = $mount.find('.palette');

    images.forEach(function (img) {
      $elems[img.key] = $elems.palette.find('.thumbnail-' + img.key);
      children[img.key] = new Thumbnail(img);
      children[img.key].bind($elems[img.key]);

      if (selectedImage.key === img.key) {
        $elems[img.key].addClass('thumbnail-selected');
      }

      // Click to select
      $elems[img.key].on('click', function () {
        selectedKey = img.key;
        // Remove class elsewhere
        $elems.palette
          .find('.thumbnail-selected')
          .removeClass('thumbnail-selected');
        // Add class here
        $elems[img.key]
          .addClass('thumbnail-selected');
      });
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
