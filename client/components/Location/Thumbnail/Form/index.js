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
var ui = require('georap-ui');
var template = require('./template.ejs');
var Palette = require('./Palette');
var locationApi = georap.stores.locations;

module.exports = function (locationId, selectedImage) {
  // Parameters:
  //   locationId
  //     Id of the location in question
  //   selectedImage
  //     attachment object. The current location thumbnail attachment
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: georap.i18n.__,
    }));

    // Display progress until palette loaded
    $elems.progress = $mount.find('.progress-container');
    children.progress = new uic.Progress();
    children.progress.bind($elems.progress);

    // Setup error view
    $elems.error = $mount.find('.error-container');

    // Cancel button
    $elems.cancel = $mount.find('.form-cancel');
    $elems.cancel.click(function () {
      $elems.cancel.off(); // Prevent double click
      self.emit('cancel');
    });

    // Get image attachment objects.
    // These will be presented for the user to pick from.
    locationApi.getAttachments({
      locationId: locationId,
      imagesOnly: true,
    }, function (err, result) {
      children.progress.unbind();

      if (err) {
        children.error = new uic.Error(err.message);
        children.error.bind($elems.error);
        return;
      }

      var images = result.attachments;

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
        children.progress.bind($elems.progress);

        // Request thumbnail change
        locationApi.setThumbnail(locationId, key, function (errs) {
          children.progress.unbind();

          if (errs) {
            // Show form
            ui.show($elems.form);
            // Show error
            children.error = new uic.Error(errs.message);
            children.error.bind($mount.find('.error-container'));

            return;
          }

          self.emit('success');
        });
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
