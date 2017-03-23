/* eslint-disable max-lines, max-statements, no-lonely-if */
/* global google */

var markerStore = require('../../../stores/markers');
var account = require('../../../stores/account');
var icons = require('../lib/icons');
var getBoundsDiagonal = require('./lib/getBoundsDiagonal');
var rawEventToMarkerLocation = require('./lib/rawEventToMarkerLocation');
var labels = require('./lib/labels');
var emitter = require('component-emitter');

module.exports = function (map) {

  // Init
  var self = this;
  emitter(self);

  // Location markers on the map. A mapping from id to google.maps.Marker
  var _markers = {};

  // Does the map load markers from the locations and display them on the map.
  // Will be set when client is ready to load markers (logged in)
  var _loaderListener = null;

  // True if map is ready for use. Will be switched to true at the first
  // 'idle' event. See addListenerOnce('idle', ...) below.
  // We need to track this for startLoadingMarkers: if map is ready
  // then load the markers immediately when called, otherwise wait for idle.
  var _mapReady = false;

  // Array of ids of locations that the user has visited.
  // Fetch them as soon as possible.
  var _visitedIds = [];

  // Private methods

  var _chooseIcon = function (loc) {
    var icon;

    var isVisited = (_visitedIds.indexOf(loc._id) !== -1);
    var isDemolished = (loc.tags.indexOf('demolished') !== -1);

    // Choose icon according to the visits
    if (isVisited) {
      // Found from visits
      if (isDemolished) {
        icon = icons.markerDemolishedVisited();
      } else {
        icon = icons.markerVisited();
      }
    } else {
      // Not found from visits
      if (isDemolished) {
        icon = icons.markerDemolished();
      } else {
        icon = icons.marker();
      }
    }

    return icon;
  };

  var _addMarker = function (loc) {
    // Create marker and add it to the map.
    //
    // Parameters:
    //   loc
    //     MarkerLocation
    // Return
    //   the created marker
    var lng, lat, m;

    lng = loc.geom.coordinates[0];
    lat = loc.geom.coordinates[1];

    m = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      icon: _chooseIcon(loc),
    });

    // Store the MarkerLocation for _id, name, and layer info.
    m.set('location', loc);

    // Label only the important, higher markers.
    if (loc.layer < map.getZoom() - 1) {
      labels.ensureLabel(m, map.getMapTypeId(), true);
    }

    m.setMap(map);
    m.addListener('click', function () {

      if (labels.hasLabel(m)) {
        self.emit('marker_activated', loc);
      } else {
        // First click shows the label
        labels.ensureLabel(m, map.getMapTypeId(), true);
      }

    });

    m.set('id', loc._id);
    _markers[loc._id] = m;

    return m;
  };

  var _removeMarker = function (m) {
    if (m) {
      // Remove from map
      m.setMap(null);

      // Remove click listener
      google.maps.event.clearInstanceListeners(m);

      delete _markers[m.get('id')];
    }
  };

  var _updateMarkers = function (locs) {
    // Add new markers and removes the excess.
    // To speed up things and avoid flicker,
    // only adds those markers on the screen that are not already there.

    var i, l, m, k;

    // For each location candidate
    for (i = 0; i < locs.length; i += 1) {
      l = locs[i];

      // If location already on the map
      if (_markers.hasOwnProperty(l._id)) {
        // Mark that it does not need to be removed.
        _markers[l._id].set('keep', true);
      } else {
        // otherwise, add it to the map.
        m = _addMarker(l);
        m.set('keep', true);
      }
    }

    // Remove markers that were not marked to be kept.
    // Also, reset keep for next update.
    for (i in _markers) {
      if (_markers.hasOwnProperty(i)) {
        m = _markers[i];
        k = m.get('keep');

        if (k) {
          // Reset for next update
          m.set('keep', false);
        } else {
          // Remove
          _removeMarker(m);
        }
      }
    }

  };

  var _loadMarkers = function () {
    var center = map.getCenter();
    var bounds = map.getBounds();
    var radius = Math.ceil(getBoundsDiagonal(bounds) / 2);
    var zoom = map.getZoom();

    markerStore.getWithin(center, radius, zoom, function (err, locs) {
      if (err) {
        return console.error(err);
      }  // else

      _updateMarkers(locs);
    });
  };

  // Bind

  // Listen for changes in locations so that the markers and labels
  // are up to date.
  markerStore.on('location_name_changed', function (ev) {
    // Parameters
    //   ev
    //     ev.data.newName
    var m, mloc;

    // No need to update if no such marker on the map.
    if (!_markers.hasOwnProperty(ev.locationId)) {
      return;
    }

    // Update name of markerLocation
    m = _markers[ev.locationId];
    mloc = m.get('location');
    mloc.name = ev.data.newName;

    // Refresh label. Force update even if label already visible
    labels.ensureLabel(m, map.getMapTypeId(), true);
  });

  markerStore.on('location_geom_changed', function (ev) {
    // Parameters
    //   ev
    //     ev.data.newGeom
    var m, g, mloc;

    // No need to update if no such marker on the map.
    if (!_markers.hasOwnProperty(ev.locationId)) {
      return;
    }

    // Update geom of markerLocation
    g = ev.data.newGeom;
    m = _markers[ev.locationId];
    mloc = m.get('location');
    mloc.geom = g;

    // Ensure coordinates are up to date
    m.setPosition({
      lat: g.coordinates[1],
      lng: g.coordinates[0],
    });
  });

  markerStore.on('location_created', function (ev) {
    var mloc = rawEventToMarkerLocation(ev);
    _addMarker(mloc);
  });

  markerStore.on('location_removed', function (ev) {
    if (_markers.hasOwnProperty(ev.locationId)) {
      var mToRemove = _markers[ev.locationId];
      _removeMarker(mToRemove);
    }
  });

  markerStore.on('location_tags_changed', function (ev) {
    // Update icon according to new tags.
    if (_markers.hasOwnProperty(ev.locationId)) {
      var m = _markers[ev.locationId];
      // First update the location
      m.get('location').tags = ev.data.newTags;
      // Update icon according to the new tags
      m.setIcon(_chooseIcon(m.get('location')));
    }
  });

  markerStore.on('location_entry_created', function (ev) {
    if (ev.data.isVisit) {
      // Add loc among visited locations if not visited before by this user.
      if (_visitedIds.indexOf(ev.locationId) === -1) {
        _visitedIds.push(ev.locationId);
      }

      // Update marker icon to visited
      if (_markers.hasOwnProperty(ev.locationId)) {
        var m = _markers[ev.locationId];
        m.setIcon(_chooseIcon(m.get('location')));
      }
    }
  });

  // Listen map type change to invert label text colors.
  map.addListener('maptypeid_changed', function () {
    labels.updateMarkerLabels(_markers, map.getMapTypeId());
  });

  // Listen zoom level change to only show labels of locations
  // with higher level than current zoom level.
  map.addListener('zoom_changed', function () {
    var z, k, m, loc;

    z = map.getZoom();

    for (k in _markers) {
      if (_markers.hasOwnProperty(k)) {
        m = _markers[k];
        loc = m.get('location');
        if (loc.layer < z - 1) {
          // Ensure that label is visible.
          labels.ensureLabel(m, map.getMapTypeId());
        } else {
          labels.hideLabel(m);
        }
      }
    }
  });

  // Track when map becomes usable.
  // See 'var _mapReady = false' above for details.
  google.maps.event.addListenerOnce(map, 'idle', function () {
    _mapReady = true;
  });



  // Public methods

  self.startLoading = function () {
    // Each idle, fetch a new set of locations.
    // The idle is emitted automatically after the initial map load.

    // Prevent duplicate listeners.
    if (_loaderListener !== null) {
      return;
    }

    // Each time map stops, fetch.
    _loaderListener = map.addListener('idle', _loadMarkers);
    // Load the first manually but only if the map is ready.
    // Map emits 'idle' when ready but user might not have been logged in yet.
    if (_mapReady) {
      _loadMarkers();
    }

    // Fetch the list of visited locations as soon as possible.
    account.getVisitedLocationIds(function (err, ids) {
      if (err) {
        console.error(err);
        return;
      }

      _visitedIds = ids;
    });
  };

  self.stopLoading = function () {
    google.maps.event.removeListener(_loaderListener);
    _loaderListener = null;
  };

  self.removeAll = function () {
    // Clear the map.
    for (var i in _markers) {
      if (_markers.hasOwnProperty(i)) {
        _removeMarker(_markers[i]);
      }
    }
  };

};
