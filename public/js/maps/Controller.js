/* global google */
var _ = require('lodash');
var infoTemplate = require('../../templates/infowindow.ejs');

module.exports = function (htmlElement, defaultMapstate) {
  // Parameters:
  //   htmlElement
  //     for the google map
  //   mapstate
  //     the default map state.

  // Init

  // Markers on the map.
  var markers = [];

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

  // Show current location on the map
  if ('geolocation' in navigator) {
    console.log('Navigator has geolocation');
    (function () {
      var m, update, icon, geoSuccess, geoError;
      var SIZE = 32;

      icon = {
        url: '/images/mapicons/mylocation.png',
        size: new google.maps.Size(SIZE, SIZE),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(SIZE / 2, SIZE / 2),
      };

      m = new google.maps.Marker({
        position: new google.maps.LatLng(0.0, 0.0),
        map: map,
        icon: icon,
      });

      update = function (lat, lng) {
        console.log(lat, lng);
        m.setPosition({
          lat: lat,
          lng: lng,
        });
      };

      geoSuccess = function (position) {
        console.log('geoSuccess');
        update(position.coords.latitude, position.coords.longitude);
      };

      geoError = function (err) {
        console.log('ERROR(' + err.code + '): ' + err.message);
      };

      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
      navigator.geolocation.watchPosition(geoSuccess, geoError);
    }());
  } else {
    console.log('No navigator.geolocation available');
  }


  // Private methods declaration

  var addLocations;
  var removeAllLocations;


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

  this.locations = {
    add: function (locations) {
      addLocations(locations);
    },
    removeAll: function () {
      removeAllLocations();
    },
  };


  // Private methods

  addLocations = function (locs) {

    // Add new markers. TODO partial update
    _.each(locs, function (loc) {
      var m = new google.maps.Marker({
        position: new google.maps.LatLng(loc.lat, loc.lng),
        title: loc.name,
      });

      m.setMap(map);
      m.addListener('click', function () {
        // Open info window
        var infowindow = new google.maps.InfoWindow({
          content: infoTemplate({ location: loc }),
        });

        infowindow.open(map, m);
      });
      markers.push(m);
    });
  };

  removeAllLocations = function () {
    // Remove markers.
    _.each(markers, function (mk) {
      mk.setMap(null);
    });
    markers = [];
  };
};
