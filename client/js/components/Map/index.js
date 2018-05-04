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

var readGoogleMapState = require('./lib/readGoogleMapState');
var AdditionMarker = require('./AdditionMarker');
var GeolocationMarker = require('./GeolocationMarker');
var Panner = require('./Panner');
var LocationMarkers = require('./LocationMarkers');

var emitter = require('component-emitter');

module.exports = function () {
  //
  // Emits:
  //   marker_activated, locationId
  //     when user clicks the marker to see the location in detail
  //

  // Init
  var self = this;
  emitter(self);

  var _map = null;
  var _geolocationMarker = null;
  var _additionMarker = null;
  var _panner = null;
  var _manager = null;


  // Private methods

  var assertBound = function () {
    if (_map === null) {
      throw new Error('Call map.bind first');
    }
  };

  // Public methods

  self.bind = function ($mount) {

    // Get initial map state i.e. coordinates, zoom level, and map type
    var initMapState = mapStateStore.get();

    _map = new google.maps.Map($mount[0], {
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
    _geolocationMarker = new GeolocationMarker(_map);
    // An addition marker. User moves this large marker to point where
    // the new location is to be created.
    _additionMarker = new AdditionMarker(_map);
    // When location page opens, map pans so that location becomes visible
    // on the background. After location page is closed, this pan is being
    // undone.
    _panner = new Panner(_map);
    // Manager for the location markers, their loading and refreshing.
    _manager = new LocationMarkers(_map);

    _geolocationMarker.bind();

    // Inform that user wants to open a location.
    // Leads to opening of location page.
    _manager.on('marker_activated', function (markerLocation) {
      self.emit('marker_activated', markerLocation);
    });

    mapStateStore.on('updated', function (newState) {
      var targetLatLng = new google.maps.LatLng(newState.lat, newState.lng);
      _map.panTo(targetLatLng);
      _map.setZoom(newState.zoom);
      _map.setMapTypeId(newState.mapTypeId);
    });

    (function defineMapStateChange() {
      // Save new state to the state store when the state of the map changes.
      var handleStateChange = function () {
        mapStateStore.update(readGoogleMapState(_map), { silent: true });
      };
      _map.addListener('idle', handleStateChange);
      _map.addListener('maptypeid_changed', handleStateChange);
    }());

  };  // bind end

  self.unbind = function () {
    // Google maps map object is impossible to unbind. Thus, we should
    // not unbind.
    throw new Error('Do not unbind a Map because a risk of memory leak.');
  };


  // Public methods

  self.addControl = function (component) {
    // Add custom content e.g. a menu on the map.
    // Bind events only after the control content is added to dom.
    // See http://stackoverflow.com/questions/17051816/
    //
    // Parameters:
    //   component
    assertBound();

    var el = document.createElement('div');

    el.className = 'tresdb-map-menu';
    _map.controls[google.maps.ControlPosition.LEFT_TOP].push(el);

    component.bind($(el));
  };

  self.panForCard = function (lat, lng) {
    // Pan map so that target location becomes centered on
    // the visible background.
    //
    // Parameters:
    //   lat, lng
    //     Coords of the location
    assertBound();
    return _panner.panForCard(lat, lng);
  };

  self.panForCardUndo = function () {
    // Undo the pan made by panForCard
    assertBound();
    return _panner.panForCardUndo();
  };

  self.removeControls = function () {
    // Remove all custom elements.
    assertBound();
    _map.controls[google.maps.ControlPosition.LEFT_TOP].clear();
  };

  self.setState = function (mapstate) {
    // Change viewport state
    assertBound();
    _map.setCenter({
      lat: mapstate.lat,
      lng: mapstate.lng,
    });
    _map.setZoom(mapstate.zoom);
    _map.setMapTypeId(mapstate.mapTypeId);
  };

  self.startLoadingMarkers = function () {
    // Each idle, fetch a new set of locations.
    // The idle is emitted automatically after the initial map load.
    assertBound();
    _manager.startLoading();
  };

  self.stopLoadingMarkers = function () {
    assertBound();
    _manager.stopLoading();
  };

  self.removeAllMarkers = function () {
    // Clear the map.
    assertBound();
    _manager.removeAll();
  };

  self.addAdditionMarker = function () {
    // Creates a draggable marker at the middle of the map.
    assertBound();
    return _additionMarker.show();
  };

  self.getAdditionMarkerGeom = function () {
    // Return GeoJSON Point at the addition marker. Throws if
    // the marker is not set.
    assertBound();
    return _additionMarker.getGeom();
  };

  self.removeAdditionMarker = function () {
    // Remove addition marker from the map.
    assertBound();
    return _additionMarker.hide();
  };

};
