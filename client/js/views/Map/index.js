/* eslint-disable max-statements */
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

var readGoogleMapState = require('../lib/readGoogleMapState');
var AdditionMarker = require('./AdditionMarker');
var GeolocationMarker = require('./GeolocationMarker');
var Panner = require('./Panner');
var LocationMarkers = require('./LocationMarkers');

var emitter = require('component-emitter');

module.exports = function () {
  //
  // Emits:
  //   location_activated, locationId
  //     when user clicks the marker to see the location in detail
  //

  // Init
  var self = this;
  emitter(self);

  // Element for the google map
  var htmlElement = document.getElementById('map');

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
  // An addition marker. User moves this large marker to point where
  // the new location is to be created.
  var _additionMarker = new AdditionMarker(map);
  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone.
  var _panner = new Panner(map);
  // Manager for the location markers, their loading and refreshing.
  var _manager = new LocationMarkers(map);

  // Bind

  // Inform that user wants to open a location.
  // Leads to opening of location page.
  _manager.on('location_activated', function (markerLocation) {
    self.emit('location_activated', markerLocation);
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

  self.addControl = function (content, bind) {
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

  self.getMap = function () {
    return map;
  };

  self.panForCard = function (lat, lng) {
    // Pan map so that target location becomes centered on
    // the visible background.
    //
    // Parameters:
    //   lat, lng
    //     Coords of the location
    return _panner.panForCard(lat, lng);
  };

  self.panForCardUndo = function () {
    // Undo the pan made by panForCard
    return _panner.panForCardUndo();
  };

  self.removeControls = function () {
    // Remove all custom elements.
    map.controls[google.maps.ControlPosition.LEFT_TOP].clear();
  };

  self.setState = function (mapstate) {
    // Change viewport state
    map.setCenter({
      lat: mapstate.lat,
      lng: mapstate.lng,
    });
    map.setZoom(mapstate.zoom);
    map.setMapTypeId(mapstate.mapTypeId);
  };

  self.hideGeolocation = function () {
    // Hide the current location.
    _geolocationMarker.hide();
  };

  self.showGeolocation = function () {
    // Show the current location on the map. Does nothing if already shown.
    _geolocationMarker.show();
  };

  self.startLoadingMarkers = function () {
    // Each idle, fetch a new set of locations.
    // The idle is emitted automatically after the initial map load.
    _manager.startLoading();
  };

  self.stopLoadingMarkers = function () {
    _manager.stopLoading();
  };

  self.removeAllMarkers = function () {
    // Clear the map.
    _manager.removeAll();
  };

  self.addAdditionMarker = function () {
    // Creates a draggable marker at the middle of the map.
    return _additionMarker.show();
  };

  self.getAdditionMarkerGeom = function () {
    // Return GeoJSON Point at the addition marker. Throws if
    // the marker is not set.
    return _additionMarker.getGeom();
  };

  self.removeAdditionMarker = function () {
    // Remove addition marker from the map.
    return _additionMarker.hide();
  };

};
