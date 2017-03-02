
var page = require('page');

var routes = require('./routes');

var MapComp = require('./components/Map');
var MainMenuComp = require('./components/MainMenu');

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

  var mapComp = new MapComp();
  mapComp.bind($('#map'));

  mapComp.on('location_activated', function (location) {
    page.show('/locations/' + location._id);

    // Pan map so that marker becomes visible
    mapComp.panForCard(location.geom.coordinates[1],
                       location.geom.coordinates[0]);
    routes.once('map_activated', function () {
      mapComp.panForCardUndo();
    });
  });

  var menuComp = new MainMenuComp({
    go: function (path) {
      return page.show(path);
    },
    onAdditionStart: function () {
      mapComp.addAdditionMarker();
    },
    onAdditionCancel: function () {
      mapComp.removeAdditionMarker();
    },
    onAdditionCreate: function () {
      var geom = mapComp.getAdditionMarkerGeom();
      mapComp.removeAdditionMarker();

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

  // Bind menu to auth events.
  account.on('login', function () {
    // Add main menu
    mapComp.addControl(menuComp);
  });
  account.on('logout', function () {
    // Remove main menu
    mapComp.removeControls();
  });

  // Bind fetching of locations and user's geolocation to auth events.
  // We could ask unauthenticated user for geolocation but this might
  // lead users to disallow sharing their location because no map is
  // yet visible.
  account.on('login', function () {
    mapComp.startLoadingMarkers();
    mapComp.showGeolocation();
  });
  account.on('logout', function () {
    mapComp.stopLoadingMarkers();
    mapComp.removeAllMarkers();  // do not expose data after log out
    mapComp.hideGeolocation();
  });

  // Init mainmenu and locations if user is already logged in,
  // because no initial login or logout events would be fired.
  if (account.isLoggedIn()) {
    mapComp.startLoadingMarkers();
    mapComp.showGeolocation();
    mapComp.addControl(menuComp);
  }

};
