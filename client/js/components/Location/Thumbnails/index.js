// A list of images from entries.

var ThumbnailView = require('./Thumbnail');
var models = require('tresdb-models');
var rootBus = require('tresdb-bus');

module.exports = function (location, entries) {
  // Parameters:
  //   location: plain location object
  //   entries: an array of entry objects
  //

  // Keep track of created views and handlers for easy unbind.
  var _thumbnailViews = {};  // id -> thumbnailView
  var bus = models.location.bus(location, rootBus);

  this.bind = function ($mount) {

    // Select first few images
    var N = 3;
    var imageEntries = models.entries.getImageEntries(entries).slice(0, N);

    imageEntries.forEach(function (entry) {
      var id = entry._id;
      var v = new ThumbnailView(entry);

      _thumbnailViews[id] = v;

      $mount.append('<div id="thumbnail-' + id + '" ' +
        'class="tresdb-location-thumbnail"></div>');
      v.bind($('#thumbnail-' + id));
    });

    // Click to scroll to the entry
    $mount.click(function (ev) {
      // Prevent link behavior and avoid reloading the view.
      ev.preventDefault();
      // If everything okay, scroll to entry.
      var entryId = ev.target.dataset.eid;
      if (typeof entryId === 'string') {
        var scrollerEl = document.getElementById('card-layer-content');
        var entryEl = document.getElementById(entryId);
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
        _thumbnailViews[id] = v;

        $mount.prepend('<div id="thumbnail-' + id + '" ' +
          'class="tresdb-location-thumbnail"></div>');
        v.bind($('#thumbnail-' + id));
      }
    });

    bus.on('location_entry_removed', function (ev) {
      // Remove entry from _thumbnailViews.
      var id = ev.data.entryId;

      if (id in _thumbnailViews) {
        var v = _thumbnailViews[id];
        delete _thumbnailViews[id];

        // Remove entry's HTML and unbind view.
        v.unbind();
        $('#thumbnail-' + id).fadeOut('slow', function () {
          $('#thumbnail-' + id).remove();
        });
      }
    });
  };

  this.unbind = function () {
    // Unbind each child
    Object.keys(_thumbnailViews).forEach(function (k) {
      _thumbnailViews[k].unbind();
    });
    bus.off();
  };
};
