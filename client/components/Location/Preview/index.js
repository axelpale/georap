// A list of images from entries.

var template = require('./template.ejs');
var models = require('georap-models');
var rootBus = require('georap-bus');
var Thumbnail = require('georap-components').Thumbnail;
var ui = require('georap-ui');

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

    $elems.preview = $mount.find('.location-preview');

    imageEntries.forEach(function (entry) {
      var elemId = 'entry-preview-' + entry._id;
      var img = models.entry.getImage(entry);
      var view = new Thumbnail(img, {
        size: 'lg',
      });
      children[elemId] = view;
      $elems.preview.append('<span id="' + elemId + '"></span>');
      view.bind($elems.preview.find('#' + elemId));
    });

    // // Click image to scroll to the entry
    // $elems.thumbnails.click(function (ev) {
    //   // Prevent link behavior and avoid reloading the view.
    //   ev.preventDefault();
    //   // If everything okay, scroll to entry.
    //   var entryId = ev.target.dataset.eid;
    //   if (typeof entryId === 'string') {
    //     var scrollerEl = document.getElementById('card-layer-content');
    //     var entryEl = document.getElementById('entry-' + entryId);
    //     // Test if such entry exists
    //     if (entryEl) {
    //       // Scroll to entry and leave a small gap.
    //       var MARGIN = 32;
    //       scrollerEl.scrollTop = entryEl.offsetTop - MARGIN;
    //     }
    //   }
    // });

    // bus.on('location_entry_created', function (ev) {
    //   if ($mount) {
    //     // Create view and store it among others
    //     var newEntry = ev.data.entry;
    //
    //     var firstImage = models.entry.getImage(newEntry);
    //     if (firstImage) {
    //       var id = newEntry._id;
    //       var v = new ThumbnailView(newEntry);
    //       children[id] = v;
    //
    //       var lenBefore = self.numThumbnails();
    //
    //       $elems.thumbnails.prepend('<div id="thumbnail-' + id + '" ' +
    //       'class="location-thumbnail"></div>');
    //       v.bind($('#thumbnail-' + id));
    //
    //       // Ensure mount is visible. Will be hidden if no images beforehand.
    //       ui.show($mount);
    //
    //       // Reveal/ensure pick-thumbnail button if enough thumbnails
    //       if (lenBefore > 0) {
    //         ui.show($elems.open);
    //       }
    //     }
    //   }
    // });
    //
    // bus.on('location_entry_removed', function (ev) {
    //   if ($mount) {
    //     // Remove entry from children.
    //     var id = ev.data.entryId;
    //
    //     if (id in children) {
    //       children[id].unbind();
    //       delete children[id];
    //
    //       // If this is the only one, hide the component.
    //       var len = self.numThumbnails();
    //       if (len === 1) {
    //         ui.hide($mount);
    //       } else if (len === 2) {
    //         // If this is the second last, hide the select button
    //         ui.hide($elems.open);
    //       }
    //
    //       // Remove entry's HTML.
    //       $('#thumbnail-' + id).fadeOut('slow', function () {
    //         $('#thumbnail-' + id).remove();
    //       });
    //     }
    //   }
    // });
  };

  // self.numThumbnails = function () {
  //   if ($mount) {
  //     return $elems.thumbnails.find('.location-thumbnail').length;
  //   }
  //   return 0;
  // };

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
