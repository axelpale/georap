/* eslint-disable max-statements, max-lines */
/* global google */

// Remember map view state (center, zoom, type...)
// Default to southern Finland.
//
// Rules:
// - Whenever user's location on the map changes, the new location
//   should be stored device-wise.
// - If no location is stored and none can be retrieved from the browser,
//   fallback to southern finland.
var mapStateStore = require('../../stores/mapstate');

var markerStore = require('../../stores/markers');
var getBoundsDiagonal = require('../lib/getBoundsDiagonal');
var readGoogleMapState = require('../lib/readGoogleMapState');
var labels = require('../lib/labels');
var icons = require('./lib/icons');
var rawEventToMarkerLocation = require('./lib/rawEventToMarkerLocation');
var convert = require('./lib/convert');
var GeolocationMarker = require('./GeolocationMarker');

var emitter = require('component-emitter');

module.exports = function () {
  //
  // Emits:
  //   location_activated, locationId
  //     when user clicks the marker to see the location in detail
  //

  // Private methods declaration

  var addMarker;
  var removeMarker;
  var updateMarkers;

  // Init
  emitter(this);
  var self = this;

  // Element for the google map
  var htmlElement = document.getElementById('map');

  // True if map is ready for use. Will be switched to true at the first
  // 'idle' event. See addListenerOnce('idle', ...) below.
  // We need to track this for startLoadingMarkers: if map is ready
  // then load the markers immediately when called, otherwise wait for idle.
  var mapReady = false;

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panForCardUndoLatLng = null;

  // Does the map load markers from the locations and display them on the map.
  // Will be set when client is ready to load markers (logged in)
  var loaderListener = null;

  // Location markers on the map. A mapping from id to google.maps.Marker
  var _markers = {};

  // An addition marker. User moves this large marker to point where
  // the new location is to be created.
  var additionMarker = null;

  // Get initial map state i.e. coordinates, zoom level, and map type
  var initMapState = mapStateStore.get();

  var map = new google.maps.Map(htmlElement, {
    center: {
      lat: initMapState.lat,
      lng: initMapState.lng,
    },
    zoom: initMapState.zoom,
    mapTypeId: initMapState.mapTypeId,

    // Controls
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
  });

  // Marker that represents geolocation of the user
  var _geolocationMarker = new GeolocationMarker(map);

  // Bind

  // Track when map becomes usable.
  // See 'var mapReady = false' above for details.
  google.maps.event.addListenerOnce(map, 'idle', function () {
    mapReady = true;
  });

  // Make addition marker to follow map center.
  map.addListener('center_changed', function () {
    if (additionMarker) {
      additionMarker.setPosition(map.getCenter());
    }
  });

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
    addMarker(mloc);
  });

  markerStore.on('location_removed', function (ev) {
    if (_markers.hasOwnProperty(ev.locationId)) {
      var mToRemove = _markers[ev.locationId];
      removeMarker(mToRemove);
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

  (function defineMapStateChange() {
    // Save new state to the state store when the state of the map changes.
    var handleStateChange = function () {
      mapStateStore.update(readGoogleMapState(map));
    };
    map.addListener('idle', handleStateChange);
    map.addListener('maptypeid_changed', handleStateChange);
  }());


  // Public methods

  this.addControl = function (content, bind) {
    // Add custom content e.g. a menu on the map.
    // Bind events only after the control content is added to dom.
    // See http://stackoverflow.com/questions/17051816/
    //
    // Parameters:
    //   content
    //     string, contains html
    //   bind
    //     function (controlContainerEl)
    var el = document.createElement('div');

    el.className = 'tresdb-map-menu';
    el.innerHTML = content;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(el);
    bind(el);
  };

  this.getMap = function () {
    return map;
  };

  this.removeControls = function () {
    // Remove all custom elements.
    map.controls[google.maps.ControlPosition.LEFT_TOP].clear();
  };

  this.setState = function (mapstate) {
    // Change viewport state
    map.setCenter({
      lat: mapstate.lat,
      lng: mapstate.lng,
    });
    map.setZoom(mapstate.zoom);
    map.setMapTypeId(mapstate.mapTypeId);
  };

  this.hideGeolocation = function () {
    // Hide the current location.
    _geolocationMarker.hide();
  };

  this.showGeolocation = function () {
    // Show the current location on the map. Does nothing if already shown.
    _geolocationMarker.show();
  };

  this.startLoadingMarkers = function () {
    // Each idle, fetch a new set of locations.
    // The idle is emitted automatically after the initial map load.

    // Prevent duplicate listeners.
    if (loaderListener !== null) {
      return;
    }

    var loadMarkers = function () {
      var center = map.getCenter();
      var bounds = map.getBounds();
      var radius = Math.ceil(getBoundsDiagonal(bounds) / 2);
      var zoom = map.getZoom();

      markerStore.getWithin(center, radius, zoom, function (err, locs) {
        if (err) {
          return console.error(err);
        }  // else

        updateMarkers(locs);
      });
    };

    // Each time map stops, fetch.
    loaderListener = map.addListener('idle', loadMarkers);
    // Load the first manually but only if the map is ready.
    // Map emits 'idle' when ready but user might not have been logged in yet.
    if (mapReady) {
      loadMarkers();
    }
  };

  this.stopLoadingMarkers = function () {
    google.maps.event.removeListener(loaderListener);
    loaderListener = null;
  };

  this.removeAllMarkers = function () {
    // Clear the map.
    for (var i in _markers) {
      if (_markers.hasOwnProperty(i)) {
        removeMarker(_markers[i]);
      }
    }
  };

  this.addAdditionMarker = function () {
    // Creates a draggable marker at the middle of the map.
    additionMarker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      icon: icons.additionMarker(),
      draggable: true,
    });

    additionMarker.addListener('dragend', function () {
      // Move the map so that the marker is at the middle.
      map.panTo(additionMarker.getPosition());
    });
  };

  this.getAdditionMarkerGeom = function () {
    // Return GeoJSON Point at the addition marker. Throws if
    // the marker is not set.

    if (additionMarker === null) {
      throw new Error('additionMarker needs to be created first');
    }

    var latlng = additionMarker.getPosition();

    return {
      type: 'Point',
      coordinates: [latlng.lng(), latlng.lat()],
    };
  };

  this.panForCard = function (lat, lng) {
    // Pan map so that target location becomes centered on
    // the visible background.
    //
    // Parameters:
    //   latlng
    //     Coords of the location

    // Store current, original center for undo.
    _panForCardUndoLatLng = map.getCenter();

    var cardWidthPx = $('#card-container').width();
    var mapWidthPx = $('body').width();
    var bgWidthPx = (mapWidthPx - cardWidthPx);
    var bgHeightPx = $('body').height();
    var bgXPx = Math.round(bgWidthPx / 2);
    var bgYPx = Math.round(bgHeightPx / 2);

    var bgPx = new google.maps.Point(bgXPx, bgYPx);
    var bgLatLng = convert.point2LatLng(bgPx, map);

    var dLat = lat - bgLatLng.lat();
    var dLng = lng - bgLatLng.lng();

    var c = map.getCenter();

    var targetLatLng = new google.maps.LatLng(c.lat() + dLat, c.lng() + dLng);
    map.panTo(targetLatLng);
  };

  this.panForCardUndo = function () {
    // Undo the pan made by panForCard
    if (_panForCardUndoLatLng) {
      map.panTo(_panForCardUndoLatLng);
    }
  };

  this.removeAdditionMarker = function () {
    // Remove addition marker from the map.
    additionMarker.setMap(null);
    additionMarker = null;
  };


  // Private methods

  addMarker = function (loc) {
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
      icon: icons.marker(),
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
        self.emit('location_activated', loc);
      } else {
        // First click shows the label
        labels.ensureLabel(m, map.getMapTypeId(), true);
      }

    });

    m.set('id', loc._id);
    _markers[loc._id] = m;

    return m;
  };

  removeMarker = function (m) {
    if (m) {
      // Remove from map
      m.setMap(null);

      // Remove click listener
      google.maps.event.clearInstanceListeners(m);

      delete _markers[m.get('id')];
    }
  };

  updateMarkers = function (locs) {
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
        m = addMarker(l);
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
          removeMarker(m);
        }
      }
    }

  };

};
