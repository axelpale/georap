// A list of images from entries.

var ThumbnailView = require('./Thumbnail');
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

    // Select first few images
    var N = 3;
    var imageEntries = models.entries.getImageEntries(entries).slice(0, N);

    // Hide if no thumbnails to show
    if (imageEntries.length === 0) {
      ui.hide($mount);
    }

    $elems.thumbnails = $mount.find('.location-thumbnails');

    imageEntries.forEach(function (entry) {
      var id = entry._id;
      var v = new ThumbnailView(entry);

      children[id] = v;

      $elems.thumbnails.append('<div id="thumbnail-' + id + '" ' +
        'class="location-thumbnail"></div>');
      v.bind($('#thumbnail-' + id));
    });

    // Click image to scroll to the entry
    $elems.thumbnails.click(function (ev) {
      // Prevent link behavior and avoid reloading the view.
      ev.preventDefault();
      // If everything okay, scroll to entry.
      var entryId = ev.target.dataset.eid;
      if (typeof entryId === 'string') {
        var scrollerEl = document.getElementById('card-layer-content');
        var entryEl = document.getElementById('entry-' + entryId);
        // Test if such entry exists
        if (entryEl) {
          // Scroll to entry and leave a small gap.
          var MARGIN = 32;
          scrollerEl.scrollTop = entryEl.offsetTop - MARGIN;
        }
      }
    });

    // Reveal pick-thumbnail button if there are more than one image.
    $elems.open = $mount.find('.location-thumbnails-open');
    if (imageEntries.length > 1) {
      ui.show($elems.open);
    }

    bus.on('location_entry_created', function (ev) {
      if ($mount) {
        // Create view and store it among others
        var newEntry = ev.data.entry;

        var firstImage = models.entry.getImage(newEntry);
        if (firstImage) {
          var id = newEntry._id;
          var v = new ThumbnailView(newEntry);
          children[id] = v;

          var lenBefore = self.numThumbnails();

          $elems.thumbnails.prepend('<div id="thumbnail-' + id + '" ' +
          'class="location-thumbnail"></div>');
          v.bind($('#thumbnail-' + id));

          // Ensure mount is visible. Will be hidden if no images beforehand.
          ui.show($mount);

          // Reveal/ensure pick-thumbnail button if enough thumbnails
          if (lenBefore > 0) {
            ui.show($elems.open);
          }
        }
      }
    });

    bus.on('location_entry_removed', function (ev) {
      if ($mount) {
        // Remove entry from children.
        var id = ev.data.entryId;

        if (id in children) {
          children[id].unbind();
          delete children[id];

          // If this is the only one, hide the component.
          var len = self.numThumbnails();
          if (len === 1) {
            ui.hide($mount);
          } else if (len === 2) {
            // If this is the second last, hide the select button
            ui.hide($elems.open);
          }

          // Remove entry's HTML.
          $('#thumbnail-' + id).fadeOut('slow', function () {
            $('#thumbnail-' + id).remove();
          });
        }
      }
    });

    // Setup form
    $elems.open.click(function () {
      if (children.form) {
        children.form.unbind();
        children.form.off('exit');
        children.form.off('success');
        delete children.form;
      } else {
        var atts = models.entries.getAttachments(entries);
        var imgs = models.attachments.getImages(atts);
        var locId = location._id;
        children.form = new ThumbnailForm(locId, location.thumbnail, imgs);
        children.form.bind($mount.find('.location-thumbnails-form-container'));
        children.form.once('exit', function () {
          children.form.unbind();
          children.form.off('success');
          delete children.form;
        });
        children.form.once('success', function () {
          children.form.unbind();
          children.form.off('exit');
          delete children.form;
        });
      }
    });
  };

  self.numThumbnails = function () {
    if ($mount) {
      return $elems.thumbnails.find('.location-thumbnail').length;
    }
    return 0;
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      // Unbind each child
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      bus.off();
    }
  };
};
