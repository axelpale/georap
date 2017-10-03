/* globals tresdb */



// Collect data access API's under tresdb global.
// This prevents cumbersome ../../../ requires.
// The tresdb global is defined in index.html

var account = require('./stores/account');
var admin = require('./stores/admin');
var events = require('./stores/events');
var locations = require('./stores/locations');
var mapstate = require('./stores/mapstate');
var markers = require('./stores/markers');
var statistics = require('./stores/statistics');
var tags = require('./stores/tags');
var users = require('./stores/users');

tresdb.stores = {
  account: account,
  admin: admin,
  events: events,
  locations: locations,
  mapstate: mapstate,
  markers: markers,
  statistics: statistics,
  tags: tags,
  users: users,
};


// Routes and main components.
var routes = require('./routes');
var MapComp = require('./components/Map');
var MainMenuComp = require('./components/MainMenu');


// Collect helpers under tresdb global.

var ui = require('./components/lib/ui');
tresdb.ui = ui;  // show and hide needed in almost every view
tresdb.go = routes.show;  // go to path. very general, thus exposed globally


// Define routes

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

  var menuComp = new MainMenuComp(mapComp);

  // Bind menu to auth events.
  account.on('login', function () {
    // Add main menu
    mapComp.addControl(menuComp);
  });
  account.on('logout', function () {
    // Remove main menu
    mapComp.removeControls();
  });

  // Bind fetching of locations to auth events.
  account.on('login', function () {
    mapComp.startLoadingMarkers();
  });
  account.on('logout', function () {
    mapComp.stopLoadingMarkers();
    mapComp.removeAllMarkers();  // do not expose data after log out
  });

  // Init mainmenu and locations if user is already logged in,
  // because no initial login or logout events would be fired.
  if (account.isLoggedIn()) {
    mapComp.startLoadingMarkers();
    mapComp.addControl(menuComp);
  }

};
