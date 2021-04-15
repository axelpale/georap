// A list of images from entries.

var ThumbnailView = require('./Thumbnail');
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

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    // Select first few images
    var N = 3;
    var imageEntries = models.entries.getImageEntries(entries).slice(0, N);

    $elems.thumbnails = $mount.find('.location-thumbnails');

    imageEntries.forEach(function (entry) {
      var id = entry._id;
      var v = new ThumbnailView(entry);

      children[id] = v;

      $elems.thumbnails.append('<div id="thumbnail-' + id + '" ' +
        'class="location-thumbnail"></div>');
      v.bind($('#thumbnail-' + id));
    });

    // Click to scroll to the entry
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

    bus.on('location_entry_created', function (ev) {
      // Create view and store it among others
      var newEntry = ev.data.entry;

      var firstImage = models.entry.getImage(newEntry);
      if (firstImage) {
        var id = newEntry._id;
        var v = new ThumbnailView(newEntry);
        children[id] = v;

        $elems.thumbnails.prepend('<div id="thumbnail-' + id + '" ' +
          'class="location-thumbnail"></div>');
        v.bind($('#thumbnail-' + id));
      }
    });

    bus.on('location_entry_removed', function (ev) {
      // Remove entry from children.
      var id = ev.data.entryId;

      if (id in children) {
        var v = children[id];
        delete children[id];

        // Remove entry's HTML and unbind view.
        v.unbind();
        $('#thumbnail-' + id).fadeOut('slow', function () {
          $('#thumbnail-' + id).remove();
        });
      }
    });
  };

  this.unbind = function () {
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
