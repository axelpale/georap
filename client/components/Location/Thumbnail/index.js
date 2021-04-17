// A list of images from entries.

var Thumbnail = require('georap-components').Thumbnail;
var ThumbnailForm = require('./Form');
var template = require('./template.ejs');
var models = require('tresdb-models');
var rootBus = require('tresdb-bus');
var ui = require('tresdb-ui');

module.exports = function (location, entries) {
  // Parameters:
  //   location: plain location object
  //   entries: an array of entry objects
  //

  var $mount = null;
  var $elems = {};
  var children = {};  // id -> thumbnailView
  var bus = models.location.bus(location, rootBus);
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());
    $elems.thumbnail = $mount.find('.location-thumbnail');
    $elems.open = $mount.find('.location-thumbnail-open');

    bus.on('location_entry_created', function (ev) {
      models.entries.forward(entries, ev);
      models.location.forward(location, ev);
      self.update();
    });

    bus.on('location_entry_changed', function (ev) {
      models.entries.forward(entries, ev);
      models.location.forward(location, ev);
      self.update();
    });

    bus.on('location_entry_removed', function (ev) {
      models.entries.forward(entries, ev);
      models.location.forward(location, ev);
      self.update();
    });

    bus.on('location_thumbnail_changed', function (ev) {
      models.location.forward(location, ev);
      self.update();
    });

    // Setup form
    $elems.open.click(function () {
      if (children.form) {
        children.form.unbind();
        children.form.off('cancel');
        children.form.off('success');
        delete children.form;
      } else {
        var atts = models.entries.getAttachments(entries);
        var imgs = models.attachments.getImages(atts);
        var locId = location._id;
        children.form = new ThumbnailForm(locId, location.thumbnail, imgs);
        children.form.bind($mount.find('.location-thumbnail-form-container'));
        children.form.once('cancel', function () {
          children.form.unbind();
          children.form.off('success');
          delete children.form;
        });
        children.form.once('success', function () {
          children.form.unbind();
          children.form.off('cancel');
          delete children.form;
        });
      }
    });

    // Initial update
    self.update();
  };

  self.update = function () {
    // Update according to current number of available image attachments.
    if ($mount) {
      // var images = models.entries.getImages(entries);

      // Hide if no thumbnails to show
      if (location.thumbnail) {
        ui.show($mount);
        if (children.thumbnail) {
          children.thumbnail.update(location.thumbnail);
        } else {
          children.thumbnail = new Thumbnail(location.thumbnail, {
            size: 'xl',
            makeLink: true,
          });
          children.thumbnail.bind($elems.thumbnail);
        }
      } else {
        ui.hide($mount);
        if (location.thumbnail) {
          children.thumbnail.unbind();
          delete children.thumbnail;
        }
      }
    }
  };

  self.unbind = function () {
    if ($mount) {
      bus.off();
      // Unbind each child
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
