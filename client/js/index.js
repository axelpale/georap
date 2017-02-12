
var page = require('page');

var routes = require('./routes');

var MapView = require('./views/Map');
var MainMenuView = require('./views/MainMenu');

// Client-side storage
var storage = require('./connection/storage');

// Authentication & Account API
var account = require('./stores/account');

// Locations API
var Locations = require('./models/Locations');
var locations = new Locations();

// Users API
var Users = require('./models/Users');
var users = new Users();



// Routing

routes.route(page, locations, users);
page.start();

// A method to expose router to map controller and main menu.
var go = function (path) {
  return page.show(path);
};



// Map init

// Function initMap is called by jsonp call after Google Maps JS script is
// loaded. Lay the main menu immediately on the map.
window.initMap = function () {

  var mapView = new MapView(storage, locations);

  mapView.on('location_activated', function (locationId) {
    page.show('/locations/' + locationId);
  });

  var mainMenuView = new MainMenuView({
    go: go,
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
    addMainMenu();
  }

};
