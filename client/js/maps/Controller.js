/* global google */
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

  // An open infowindow. Allow only single infowindow to be open at the time.
  var infowindow = null;

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
        url: '/assets/images/mapicons/mylocation.png',
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

      //console.log('getCurrentPosition');
      //navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
      console.log('watchPosition');
      navigator.geolocation.watchPosition(geoSuccess, geoError);
    }());
  } else {
    console.log('No navigator.geolocation available');
  }


  // Private methods declaration

  var addMarker;
  var removeMarker;
  var updateLocations;
  var removeAllMarkers;

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

    var lng = loc.geom.coordinates[0];
    var lat = loc.geom.coordinates[1];

    var m = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      title: loc.name,
    });

    m.setMap(map);
    m.addListener('click', function () {

      // Close previous, possibly open infowindow.
      if (infowindow !== null) {
        infowindow.close();
      }

      // Open new info window
      infowindow = new google.maps.InfoWindow({
        content: infoTemplate({ location: loc }),
      });

      infowindow.open(map, m);
    });

    m.set('id', loc._id);
    markers[loc._id] = m;

    return m;
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
    var i;

    for (i in markers) {
      if (markers.hasOwnProperty(i)) {
        removeMarker(markers[i]);
      }
    }
  };
};
