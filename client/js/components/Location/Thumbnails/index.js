// A list of images from entries.

var ThumbnailView = require('./Thumbnail');
var entriesModel = require('../Entriex/model');
var entryModel = require('../Entriex/Entry/model');

module.exports = function (location, entries) {
  // Parameters:
  //   location: plain location object
  //   entries: an array of entry objects
  //

  // Keep track of created views and handlers for easy unbind.
  var _thumbnailViewsMap = {};  // id -> thumbnailView
  var locBus = locationModel.bus(location);

  // Sketching. Place to locationModel
  exports.bus = function (location) {
    var routes = [];
    return {

      on: function (evName, handler) {
        var route = bus.on(evName, function (ev) {
          if (ev.locationId === location._id) {
            return handler(ev);
          }
        });
        routes.push(route);
      },

      off: function () {
        routes.forEach(function (route) {
          bus.off(route);
        });
        routes = null; // for garbage collector
      },

    };
  };

  this.bind = function ($mount) {

    // Select first few images
    var N = 3;
    var imageEntries = entriesModel.getImageEntries(entries).slice(0, N);

    imageEntries.forEach(function (entry) {
      var id = entry._id;
      var v = new ThumbnailView(entry);

      _thumbnailViewsMap[id] = v;

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

    locationModel.bus(location, 'location_entry_created')

    locBus.on('location_entry_created', function (ev) {
      // Create view and store it among others
      var newEntry = ev.data.entry;

      var firstImage = entryModel.getImage(newEntry);
      if (firstImage) {
        var id = newEntry._id;
        var v = new ThumbnailView(newEntry);
        _thumbnailViewsMap[id] = v;

        $mount.prepend('<div id="thumbnail-' + id + '" ' +
          'class="tresdb-location-thumbnail"></div>');
        v.bind($('#thumbnail-' + id));
      }
    });

    locBus.on('location_entry_removed', function (ev) {
      // Remove entry from _thumbnailViewsMap.
      var id = ev.data.entryId;

      if (id in _thumbnailViewsMap) {
        var v = _thumbnailViewsMap[id];
        delete _thumbnailViewsMap[id];

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
    Object.keys(_thumbnailViewsMap).forEach(function (k) {
      _thumbnailViewsMap[k].unbind();
    });
    locBus.off();
  };
};
