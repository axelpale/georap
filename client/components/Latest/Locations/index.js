// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var LocationSelector = require('../LocationSelector');
var rootBus = require('tresdb-bus');
var models = require('tresdb-models');
var locationsStore = tresdb.stores.locations;

var LIST_SIZE = 50;

module.exports = function () {
  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};
  var localBus = models.bus(rootBus);

  var skip = 0;
  var limit = LIST_SIZE;

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    // Select associated marker by clicking an event or hovering cursor on it.
    $elems.locations = $mount.find('.latest-locations');
    children.selector = new LocationSelector();
    children.selector.bind($elems.locations);

    // Update location name
    localBus.on('location_name_changed', function (ev) {
      // TODO check if location in list and update name if so
      console.log('update name to', ev.data.newName);
    });

    // Setup load-more
    $elems.progress = $mount.find('.latest-locations-progress');
    $elems.loadMoreBtn = $mount.find('.latest-load-more');
    ui.show($elems.loadMoreBtn);
    $elems.loadMoreBtn.click(function () {
      console.log('click');
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);
      skip += limit;
      locationsStore.getLatest({
        skip: skip,
        limit: limit,
      }, function (errmore, latestResult) {
        var morelocs = latestResult.locations;
        var total = latestResult.locationCount;
        ui.hide($elems.progress);
        if (errmore) {
          $mount.find('.latest-locations-error').html(errmore.message);
          ui.show($mount.find('.latest-locations-error'));
          return;
        }
        $elems.locations.append(listTemplate({
          skip: skip,
          limit: limit,
          total: total,
          locations: morelocs,
          timestamp: ui.timestamp,
        }));
        ui.show($elems.loadMoreBtn);
      });
    });

    // Initial event fetch and list render
    self.update();
  };

  self.update = function () {
    if ($mount) {
      // Reload events and render
      locationsStore.getLatest({
        skip: skip,
        limit: limit,
      }, function (err, latestResult) {
        var locs = latestResult.locations;
        var total = latestResult.locationCount;
        // Ensure loading bar is hidden.
        ui.hide($mount.find('.latest-locations-progress'));

        if (err) {
          $mount.find('.latest-locations-error').html(err.message);
          ui.show($mount.find('.latest-locations-error'));
          return;
        }

        // Collect location data in events. Use to emphasize map markers.
        // TODO children.selector.readMarkerLocationsFromLocations(locs);

        // Refresh the list
        $elems.locations.html(listTemplate({
          skip: skip,
          limit: limit,
          total: total,
          locations: locs,
          timestamp: ui.timestamp,
        }));

        // Signal that the list is rendered.
        // It seems that setTimeout is required to allow the fetched events
        // to fill the scrollable container.
        setTimeout(function () {
          self.emit('idle');
        }, 0);
      });
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      // Stop listening events
      localBus.off();
      // Unbind events view
      ui.unbindAll(children);
      ui.offAll($elems);
      children = {};
    }
  };
};
