var models = require('georap-models');
var locations = tresdb.stores.locations;

module.exports = function () {
  // Init
  var $mount = null;
  // Collect location data in events. Can be used to display
  // markers associated with the events.
  var fetchedMarkerLocations = {};

  this.bind = function ($mountEl) {
    // Select associated marker by clicking an event or hovering cursor on it.
    //
    // NOTE Prevent duplicate binds by unbinding properly
    //
    $mount = $mountEl;

    var _trySelectLocation = function (ev) {
      var locationId = null;
      var el = ev.target;
      if (typeof el.dataset.locationid === 'string') {
        locationId = el.dataset.locationid;
      } else {
        el = el.parentElement;
        if (typeof el.dataset.locationid === 'string') {
          locationId = el.dataset.locationid;
        } else {
          el = el.parentElement;
          if (typeof el.dataset.locationid === 'string') {
            locationId = el.dataset.locationid;
          }
        }
      }
      if (locationId) {
        var mloc = fetchedMarkerLocations[locationId];
        if (mloc) {
          locations.selectLocation(mloc);
        }
      }
    };

    // Detect hover
    $mount.on('click', _trySelectLocation);
    $mount.on('mouseover', _trySelectLocation);

    // Detect outside li
    $mount.on('mouseout', function (ev) {
      if (typeof ev.target.dataset.locationid === 'string') {
        var locationId = ev.target.dataset.locationid;
        locations.deselectLocation(locationId);
      }
    });
  };

  this.readMarkerLocationsFromEvents = function (evs) {
    // Collect location data in events. Use to emphasize map markers.
    evs.forEach(function (ev) {
      if (ev.location) {
        var mloc = models.location.toMarkerLocation(ev.location);
        fetchedMarkerLocations[mloc._id] = mloc;
      }
    });
  };

  this.readMarkerLocationsFromLocations = function (locs) {
    // Collect location data in events. Use to emphasize map markers.
    locs.forEach(function (loc) {
      var mloc = models.location.toMarkerLocation(loc);
      fetchedMarkerLocations[mloc._id] = mloc;
    });
  };

  this.unbind = function () {
    if ($mount) {
      // Prevent duplicate binds. Causes flicker.
      $mount.off('click');
      $mount.off('mouseover');
      $mount.off('mouseout');
      $mount = null;
      // Deselect any selected locations
      locations.deselectAll();
      // Ensure that fetched locations become garbage collected
      Object.keys(fetchedMarkerLocations).forEach(function (lid) {
        delete fetchedMarkerLocations[lid];
      });
    }
  };
};
