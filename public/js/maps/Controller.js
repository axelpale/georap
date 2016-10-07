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
