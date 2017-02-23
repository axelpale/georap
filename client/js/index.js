
var page = require('page');

var routes = require('./routes');

var MapView = require('./views/Map');
var MainMenuView = require('./views/MainMenu');

// Authentication & Account API
var account = require('./stores/account');

// Locations API
var locations = require('./stores/locations');



// Routing

routes.route(page);
page.start();



// Map init

// Function initMap is called by jsonp call after Google Maps JS script is
// loaded. Lay the main menu immediately on the map.
window.initMap = function () {

  var mapView = new MapView();

  mapView.on('location_activated', function (location) {
    page.show('/locations/' + location._id);

    // Pan map so that marker becomes visible
    mapView.panForCard(location.geom.coordinates[1],
                       location.geom.coordinates[0]);
    routes.once('map_activated', function () {
      mapView.panForCardUndo();
    });
  });

  var mainMenuView = new MainMenuView({
    go: function (path) {
      return page.show(path);
    },
    onAdditionStart: function () {
      mapView.addAdditionMarker();
    },
    onAdditionCancel: function () {
      mapView.removeAdditionMarker();
    },
    onAdditionCreate: function () {
      var geom = mapView.getAdditionMarkerGeom();
      mapView.removeAdditionMarker();

      locations.create(geom, function (err) {
        // Parameters
        //   err
        //   newLoc

        if (err) {
          console.error(err);
          return;
        }
      });
    },
  });

  var addMainMenu = function () {
    mapView.addControl(mainMenuView.render(), function (root) {
      // Special bind handling: addControl cannot add content to dom instantly.
      mainMenuView.bind(root);
    });
  };

  var removeMainMenu = function () {
    mapView.removeControls();
  };

  // Bind menu to auth events.
  account.on('login', function () {
    addMainMenu();
  });
  account.on('logout', function () {
    removeMainMenu();
  });

  // Bind fetching of locations and user's geolocation to auth events.
  // We could ask unauthenticated user for geolocation but this might
  // lead users to disallow sharing their location because no map is
  // yet visible.
  account.on('login', function () {
    mapView.startLoadingMarkers();
    mapView.showGeolocation();
  });
  account.on('logout', function () {
    mapView.stopLoadingMarkers();
    mapView.removeAllMarkers();  // do not expose data after log out
    mapView.hideGeolocation();
  });

  // Init mainmenu and locations if user is already logged in,
  // because no initial login or logout events would be fired.
  if (account.isLoggedIn()) {
    mapView.startLoadingMarkers();
    mapView.showGeolocation();
    addMainMenu();
  }

};
