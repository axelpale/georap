// Well
//
// Form
//
// List All available entry images
//
// Emphasize the selected
//
// Cancel
//
// Save

var emitter = require('component-emitter');
var uic = require('georap-components');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var Palette = require('./Palette');
var locationApi = tresdb.stores.locations;

module.exports = function (locationId, selectedImage, images) {
  // Parameters:
  //   locationId
  //     Id of the location in question
  //   selectedImage
  //     attachment object. The current location thumbnail attachment
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

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));

    // Cancel button
    $elems.cancel = $mount.find('.form-cancel');
    $elems.cancel.click(function () {
      $elems.cancel.off(); // Prevent double click
      self.emit('cancel');
    });

    // Palette of thumbnails
    $elems.palette = $mount.find('.palette-container');
    children.palette = new Palette(selectedImage, images);
    children.palette.bind($elems.palette);

    // Palette pick
    children.palette.on('pick', function (att) {
      self.emit('pick', att);
    });

    // Form submit
    $elems.form = $mount.find('.location-thumbnails-form');
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      // Read selected attachment key
      var key = children.palette.getSelectedKey();

      // If ok, hide form and reveal progress bar
      ui.hide($elems.form);

      children.progress = new uic.Progress();
      children.progress.bind($mount.find('.progress-container'));

      // Request thumbnail change
      locationApi.setThumbnail(locationId, key, function (err) {
        children.progress.unbind();

        if (err) {
          // Show form
          ui.show($elems.form);
          // Show error
          children.error = new uic.Error(err.message);
          children.error.bind($mount.find('.error-container'));

          return;
        }

        self.emit('success');
      });
    });
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
