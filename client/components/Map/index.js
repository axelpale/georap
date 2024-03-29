/* eslint-disable max-statements */
/* global google */

// Remember map view state (center, zoom, type...)
//
// Rules:
// - Whenever user's position on the map changes, the new position
//   should be stored to browser's local storage.
//

var readGoogleMapState = require('./lib/readGoogleMapState');
var AdditionMarker = require('./AdditionMarker');
var CrosshairMarker = require('./CrosshairMarker');
var GeolocationMarker = require('./GeolocationMarker');
var Panner = require('./Panner');
var LocationMarkers = require('./LocationMarkers');
var emitter = require('component-emitter');
var geometryModel = require('georap-models').geometry;
var mapStateStore = georap.stores.mapstate;
var bus = require('georap-bus');

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
  var _crosshairMarker = null; // eslint-disable-line no-unused-vars
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
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
      scaleControl: true, // small scale stick next to terms of use
    });

    // An addition marker. User moves this large marker to point where
    // the new location is to be created.
    _additionMarker = new AdditionMarker(_map);
    // Crosshair marker. Shown during crosshair page.
    _crosshairMarker = new CrosshairMarker(_map);
    // When location page opens, map pans so that location becomes visible
    // on the background. After location page is closed, this pan is being
    // undone.
    _panner = new Panner(_map);
    // Manager for the location markers, their loading and refreshing.
    _manager = new LocationMarkers(_map);

    // Inform that user wants to open a location.
    // Leads to opening of location page.
    _manager.on('marker_activated', function (markerLocation) {
      self.emit('marker_activated', markerLocation);
    });


    (function defineMapStateChange() {
      // Save new state to the state store when the state of the map changes.
      // Prevent update emit loop by checking if state really changed.
      // Alternative prevention method would be to set option { silent: true }
      // when updating the store. However, then other listeners would not
      // receive updates.
      var oldState = initMapState;
      var selfEmitted = false;
      mapStateStore.on('updated', function (newState) {
        if (selfEmitted) {
          // Mark as handled
          selfEmitted = false;
        } else {
          // Change was done elsewehere.
          if (
            oldState.lat !== newState.lat ||
            oldState.lng !== newState.lng
          ) {
            var target = new google.maps.LatLng(newState.lat, newState.lng);
            _map.panTo(target);
          }

          if (oldState.zoom !== newState.zoom) {
            _map.setZoom(newState.zoom);
          }

          if (oldState.mapTypeId !== newState.mapTypeId) {
            _map.setMapTypeId(newState.mapTypeId);
          }
        }

        oldState = newState;
      });

      var handleStateChange = function () {
        selfEmitted = true;
        mapStateStore.update(readGoogleMapState(_map));
      };
      _map.addListener('idle', handleStateChange);
      _map.addListener('maptypeid_changed', handleStateChange);
    }());

    (function defineMapFocused() {
      var handle = function () {
        self.emit('map_focused');
      };
      _map.addListener('click', handle);
    }());

    // User inputs new coordinates. Move the map so that
    // the crosshair moves to the new position.
    bus.on('crosshair_form_submit', function (ev) {
      _panner.panForCard(ev.latLng);
    });
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

    el.className = 'georap-map-menu';
    _map.controls[google.maps.ControlPosition.LEFT_TOP].push(el);

    component.bind($(el));
  };

  self.panForCard = function (geom) {
    // Pan map so that the given geom becomes centered on
    // the visible portion of the map next to the card page.
    //
    // Parameters:
    //   geom
    //     a GeoJSON Point. In future this can also be a complex shape.
    //
    assertBound();
    return _panner.panForCard(geometryModel.pointToLatLng(geom));
  };

  self.panUndo = function () {
    // DEAD CODE
    // Undo the pan made by panForCard
    assertBound();
    return _panner.panUndo();
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

  self.startLoadingFlags = function () {
    assertBound();
    _manager.startLoadingFlags();
  };

  self.stopLoadingFlags = function () {
    assertBound();
    _manager.stopLoadingFlags();
  };

  self.removeAllFlags = function () {
    // Clear the map.
    assertBound();
    _manager.removeAllFlags();
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

  self.addGeolocationButton = function () {
    // Marker that represents geolocation of the user
    if (_map && !_geolocationMarker) {
      _geolocationMarker = new GeolocationMarker(_map);
      _geolocationMarker.bind();
    }
  };

  self.removeGeolocationButton = function () {
    // Marker that represents geolocation of the user
    if (_geolocationMarker) {
      _geolocationMarker.unbind();
      _geolocationMarker = null;
    }
  };

};
