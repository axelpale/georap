// A list of images from entries.

var Thumbnail = require('georap-components').Thumbnail;
var ThumbnailForm = require('./Form');
var template = require('./template.ejs');
var models = require('georap-models');
var rootBus = require('georap-bus');
var ui = require('georap-ui');

module.exports = function (location) {
  // Parameters:
  //   location
  //     A location object with thumbnail completed.
  //     The attachments are loaded when the form is opened.
  //

  var $mount = null;
  var $elems = {};
  var children = {};
  var bus = models.location.bus(location, rootBus);
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());
    $elems.thumbnail = $mount.find('.location-thumbnail');
    $elems.open = $mount.find('.location-thumbnail-open');

    bus.on('location_entry_created', function (ev) {
      models.location.forward(location, ev);
      self.update();
    });

    bus.on('location_entry_changed', function (ev) {
      models.location.forward(location, ev);
      self.update();
    });

    bus.on('location_entry_removed', function (ev) {
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
        children.form = new ThumbnailForm(location._id, location.thumbnail);
        children.form.bind($mount.find('.location-thumbnail-form-container'));
        children.form.once('cancel', function () {
          children.form.unbind();
          children.form.off('success');
          delete children.form;
          // Return thumbnail to original
          if (children.thumbnail) {
            children.thumbnail.update(location.thumbnail);
          }
        });
        children.form.once('success', function () {
          children.form.unbind();
          children.form.off('cancel');
          delete children.form;
        });
        children.form.on('pick', function (att) {
          if (children.thumbnail) {
            children.thumbnail.update(att);
          }
        });
      }
    });

    // Initial update
    self.update();
  };

  self.update = function () {
    // Update according to thumbnail availability.
    if ($mount) {

      // Hide if no thumbnails to show
      if (location.thumbnail) {
        ui.show($mount);
        if (children.thumbnail) {
          children.thumbnail.update(location.thumbnail);
        } else {
          children.thumbnail = new Thumbnail(location.thumbnail, {
            size: 'xxl',
            makeLink: true,
          });
          children.thumbnail.bind($elems.thumbnail);
        }
      } else {
        ui.hide($mount);
        if (children.thumbnail) {
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
