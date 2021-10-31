// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var LocationSelector = require('../LocationSelector');
var rootBus = require('georap-bus');
var locationsStore = tresdb.stores.locations;

var LIST_SIZE = 50;

module.exports = function () {
  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};
  var bus = rootBus.sub();

  var skip = 0;
  var limit = LIST_SIZE;

  var appendLocations = function (locs, total) {
    if ($mount) {
      // Collect location data in events. Use to emphasize map markers.
      children.selector.readMarkerLocationsFromLocations(locs);
      // Append to bottom
      $elems.locations.append(listTemplate({
        skip: skip,
        limit: limit,
        total: total,
        locations: locs,
        timestamp: ui.timestamp,
        placestamp: ui.placestamp,
      }));
    }
  };

  var fetchAndAppend = function (callback) {
    if ($mount) {
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);

      locationsStore.getLatest({
        skip: skip,
        limit: limit,
      }, function (errmore, latestResult) {
        // Possibly unbound during the request
        if ($mount) {
          ui.hide($elems.progress);
          if (errmore) {
            $elems.error.html(errmore.message);
            ui.show($elems.error);
            return;
          }

          var morelocs = latestResult.locations;
          var total = latestResult.locationCount;

          appendLocations(morelocs, total);

          ui.show($elems.loadMoreBtn);

          if (callback) {
            return callback();
          }
        }
      });
    }
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    // Select associated marker by clicking an event or hovering cursor on it.
    $elems.locations = $mount.find('.latest-locations');
    children.selector = new LocationSelector();
    children.selector.bind($elems.locations);

    // Update location name
    bus.on('location_name_changed', function (ev) {
      // Check if location in list and update name if so
      var query = 'li[data-locationid="' + ev.locationId + '"]';
      var $li = $elems.locations.find(query); // empty set if not found
      $li.find('h4 > a').html(ev.data.newName);
    });

    // Setup load-more button
    $elems.progress = $mount.find('.latest-locations-progress');
    $elems.loadMoreBtn = $mount.find('.latest-load-more');
    $elems.error = $mount.find('.latest-locations-error');

    $elems.loadMoreBtn.click(function () {
      skip += limit;
      fetchAndAppend();
    });

    // Initial event fetch and list render
    fetchAndAppend(function () {
      // Signal that the list is rendered.
      // It seems that setTimeout is required to allow the fetched events
      // to fill the scrollable container.
      setTimeout(function () {
        self.emit('idle');
      }, 0);
    });
  };

  // self.update = function () {
  //   if ($mount) {
  //
  // };

  self.unbind = function () {
    if ($mount) {
      // Stop listening events
      bus.off();
      // Unbind events view
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      // Clear
      $mount.empty();
      $mount = null;
    }
  };
};
