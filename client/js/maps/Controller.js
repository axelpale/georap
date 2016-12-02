/* eslint-disable max-statements, max-lines */
/* global google */

var icons = require('./lib/icons');
var labels = require('./lib/labels');
var getBoundsDiagonal = require('./lib/getBoundsDiagonal');

module.exports = function (htmlElement, defaultMapstate, api, go) {
  // Parameters:
  //   htmlElement
  //     for the google map
  //   mapstate
  //     the default map state.
  //   api
  //     locations.Service instance.
  //   go
  //     function (path): ask router to go to path.

  // Private methods declaration

  var addMarker;
  var ensureLabel;
  var hasLabel;
  var removeMarker;
  var updateLocations;
  var removeAllMarkers;

  // Init

  // Does the map load markers form the api and display them on the map.
  // Will be set e.g. when client is ready to load markers (logged in)
  var loaderListener = null;

  // Location markers on the map.
  var markers = {};

  // An addition marker. User moves this large marker to point where
  // the new location is to be created.
  var additionMarker = null;

  // Marker that represents geolocation of the user
  var geolocationMarker = null;
  var geolocationWatchId = null;

  var map = new google.maps.Map(htmlElement, {
    center: {
      lat: defaultMapstate.lat,
      lng: defaultMapstate.lng,
    },
    zoom: defaultMapstate.zoom,
    mapTypeId: defaultMapstate.mapTypeId,

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

  // Make addition marker to follow map center.
  map.addListener('center_changed', function () {
    if (additionMarker) {
      additionMarker.setPosition(map.getCenter());
    }
  });

  // Listen for changes in locations so that the markers and labels
  // are up to date.
  api.on('locations/rename/success', function (updatedLoc) {
    var m;

    if (markers.hasOwnProperty(updatedLoc._id)) {
      m = markers[updatedLoc._id];
      m.set('location', updatedLoc);
      ensureLabel(m, true);  // force update even if label already visible
    }
  });

  // Listen map type change to invert label text colors.
  map.addListener('maptypeid_changed', function () {
    var type, color, k, label;

    type = map.getMapTypeId();
    color = labels.mapTypeIdToLabelColor(type);

    for (k in markers) {
      if (markers.hasOwnProperty(k)) {
        label = markers[k].getLabel();
        label.color = color;
        markers[k].setLabel(label);
      }
    }
  });

  // Listen zoom level change to only show labels of locations
  // with higher level than current zoom level.
  map.addListener('zoom_changed', function () {
    var z, k, m, loc;

    z = map.getZoom();

    for (k in markers) {
      if (markers.hasOwnProperty(k)) {
        m = markers[k];
        loc = m.get('location');
        if (loc.layer < z - 1) {
          // Ensure that label is visible.
          ensureLabel(m);
        } else {
          // Hide label
          m.setLabel(null);
        }
      }
    }
  });


  // Public methods

  this.addControl = function (content, bind) {
    // Add custom content e.g. a menu on the map.
    // Bind events only after the control content is added to dom.
    // See http://stackoverflow.com/questions/17051816/
    //
    // Parameters:
    //   content
    //     string, contains html
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
    // Stop watching device's location
    if (geolocationWatchId !== null) {
      if ('geolocation' in navigator) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
      }
    }
    // Remove marker
    if (geolocationMarker !== null) {
      geolocationMarker.setMap(null);
      geolocationMarker = null;
    }
  };

  this.showGeolocation = function () {
    // Show current location on the map. Does nothing if already shown.

    var update, geoSuccess, geoError, id;

    // If geolocation is not already shown and geolocation is available.
    if (geolocationMarker === null && 'geolocation' in navigator) {

      geolocationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0.0, 0.0),
        map: map,
        icon: icons.geolocation(),
      });

      update = function (lat, lng) {
        geolocationMarker.setPosition({
          lat: lat,
          lng: lng,
        });
      };

      geoSuccess = function (position) {
        update(position.coords.latitude, position.coords.longitude);
      };

      geoError = function (err) {
        console.error(err);
      };

      id = navigator.geolocation.watchPosition(geoSuccess, geoError);
      geolocationWatchId = id;

    }  // Else, no navigator.geolocation available
  };

  this.startLoadingMarkers = function () {
    // Each idle, fetch a new set of locations.

    // Prevent duplicate listeners.
    if (loaderListener !== null) {
      return;
    }

    loaderListener = map.addListener('idle', function () {
      var center = map.getCenter();
      var bounds = map.getBounds();
      var radius = Math.ceil(getBoundsDiagonal(bounds) / 2);
      var zoomLevel = map.getZoom();

      api.getMarkersWithin(center, radius, zoomLevel, function (err, locs) {
        if (err) {
          return console.error(err);
        }  // else

        updateLocations(locs);
      });
    });
  };

  this.stopLoadingMarkers = function () {
    google.maps.event.removeListener(loaderListener);
    loaderListener = null;
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

  this.removeAdditionMarker = function () {
    // Remove addition marker from the map.
    additionMarker.setMap(null);
    additionMarker = null;
  };

  this.locations = {
    addOne: function (location) {
      addMarker(location);
    },
    update: function (locations) {
      updateLocations(locations);
    },
    removeAll: function () {
      removeAllMarkers();
    },
  };


  // Private methods

  addMarker = function (loc) {
    // Create marker and add it to the map.
    //
    // Return
    //   the created marker
    var lng, lat, m;

    lng = loc.geom.coordinates[0];
    lat = loc.geom.coordinates[1];

    m = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      icon: icons.marker(),
    });

    // Store the location for _id, name, and layer info.
    m.set('location', loc);

    // Label only the important, higher markers.
    if (loc.layer < map.getZoom() - 1) {
      ensureLabel(m, true);
    }

    m.setMap(map);
    m.addListener('click', function () {

      if (hasLabel(m)) {
        go('/location/' + loc._id);
      } else {
        ensureLabel(m, true);
      }

    });

    m.set('id', loc._id);
    markers[loc._id] = m;

    return m;
  };

  ensureLabel = function (marker, forceUpdate) {
    // Ensure that label is visible.
    //
    // Parameters:
    //   marker
    //     A marker with marker.get('location') set.
    //   forceUpdate
    //     bool. Optional, default false.
    //     If true, update the label even when already visible.

    var loc = marker.get('location');

    // Note: getLabel can return undefined or null, regarding
    // whether setLabel(null) is called or not.
    if (forceUpdate || !marker.getLabel()) {
      marker.setLabel({
        color: labels.mapTypeIdToLabelColor(map.getMapTypeId()),
        text: (loc.name === '' ? 'Untitled' : loc.name),
      });
    }
  };

  hasLabel = function (marker) {
    // Return true if marker has label visible.
    return Boolean(marker.getLabel());
  };

  removeMarker = function (m) {
    if (m) {
      m.setMap(null);
      delete markers[m.get('id')];
    }
  };

  updateLocations = function (locs) {
    // Add new markers and removes the excess.
    // To speed up things and avoid flicker,
    // only adds those markers on the screen that are not already there.

    var i, l, m, k;

    // For each location candidate
    for (i = 0; i < locs.length; i += 1) {
      l = locs[i];

      // If location already on the map
      if (markers.hasOwnProperty(l._id)) {
        // Mark that it does not need to be removed.
        markers[l._id].set('keep', true);
      } else {
        // otherwise, add it to the map.
        m = addMarker(l);
        m.set('keep', true);
      }
    }

    // Remove markers that were not marked to be kept.
    // Also, reset keep for next update.
    for (i in markers) {
      if (markers.hasOwnProperty(i)) {
        m = markers[i];
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

  removeAllMarkers = function () {
    // Clear the map.
    for (var i in markers) {
      if (markers.hasOwnProperty(i)) {
        removeMarker(markers[i]);
      }
    }
  };
};
