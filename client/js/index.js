
var routes = require('./routes');

var MapComp = require('./components/Map');
var MainMenuComp = require('./components/MainMenu');

// Authentication & Account API
var account = require('./stores/account');



// Routing

routes.route();



// Map init

// Function initMap is called by jsonp call after Google Maps JS script is
// loaded. Lay the main menu immediately on the map.
window.initMap = function () {

  var mapComp = new MapComp();
  mapComp.bind($('#map'));

  mapComp.on('marker_activated', function (location) {
    // Open location component. Router will emit location_routed
    routes.show('/locations/' + location._id);

    // Once user returns to map, undo the pan.
    routes.once('map_routed', function () {
      mapComp.panForCardUndo();
    });
  });

  routes.on('location_routed', function (location) {
    // Via whatever way user arrived to loc,
    // pan map so that marker becomes visible.
    mapComp.panForCard(location.getGeom());
  });

  var menuComp = new MainMenuComp(mapComp, function go(path) {
    return routes.show(path);
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
