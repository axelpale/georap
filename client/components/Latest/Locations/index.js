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

var LIST_SIZE = 100;

module.exports = function () {
  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};
  var localBus = models.bus(rootBus);

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

    // Initial event fetch and list render
    self.update();
  };

  self.update = function () {
    if ($mount) {
      // Reload events and render
      locationsStore.getLatest(LIST_SIZE, function (err, locs) {
        // Ensure loading bar is hidden.
        ui.hide($mount.find('.latest-locations-progress'));

        if (err) {
          console.error(err);
          return;
        }

        // Collect location data in events. Use to emphasize map markers.
        // TODO children.selector.readMarkerLocationsFromLocations(locs);

        // Refresh the events list
        $elems.locations.html(listTemplate({
          locations: locs,
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
      children = {};
    }
  };
};
