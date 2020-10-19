/* globals tresdb */



// Collect data access API's under tresdb global.
// This prevents cumbersome ../../../ requires.
// The tresdb global is defined in index.html

var account = require('./stores/account');
var admin = require('./stores/admin');
var events = require('./stores/events');
var filter = require('./stores/filter');
var locations = require('./stores/locations');
var mapstate = require('./stores/mapstate');
var markers = require('./stores/markers');
var statistics = require('./stores/statistics');
var users = require('./stores/users');
var minibus = require('minibus');

// The html contains tresdb object,
// preset with some config.
// Let us append the stores to the global namespace.
tresdb.stores = {
  account: account,
  admin: admin,
  events: events,
  filter: filter,
  locations: locations,
  mapstate: mapstate,
  markers: markers,
  statistics: statistics,
  users: users,
};
// Create also a global bus. Spaghetti or not?
tresdb.bus = minibus.create();
// DEBUG Bus is easy to listen:
// tresdb.bus.on(function (ev) {
//   console.log(ev);
// });


// Routes and main components.
var routes = require('./routes');
var MapComp = require('./components/Map');
var MainMenuComp = require('./components/MainMenu');


// Collect helpers under tresdb global.
tresdb.go = routes.show;  // go to path. very general, thus exposed globally


// Define routes

routes.route();



// Map init

// Function initMap is called by jsonp call after Google Maps JS script is
// loaded. Lay the main menu immediately on the map.
window.initMap = function () {

  var mapComp = new MapComp();
  mapComp.bind($('#map'));

  // To view cards in full screen mode. See issue #94
  var $fullscreenDiv = $('#map').children('div:first');
  $('#card-layer').appendTo($fullscreenDiv);

  // To prevent double clicks and programmatic pans from closing the card
  // immediately after opening, we use a cooldown timeout.
  var cardCooldown = false;

  mapComp.on('marker_activated', function (mloc) {
    // Open location component.
    // If the marker is the current location, close the current location.
    // To prevent double-clicks from opening and closing the location,
    // close only after cardCooldown period.
    var locPath = '/locations/' + mloc._id;

    if (!cardCooldown) {
      if (locPath === routes.getCurrentPath()) {
        routes.show('/');
      } else {
        routes.show(locPath);
      }
    }
    // NOTE Router will emit location_routed.
  });

  // Touching the map will close the card.
  mapComp.on('map_focused', function () {
    // console.log('map_state_change');
    // console.log('routes.path()', routes.getCurrentPath())
    if (routes.getCurrentPath() !== '/' && !cardCooldown) {
      routes.show('/');
    }
  });

  // Map should react to location position and also to a change
  // of the position.
  routes.on('location_routed', function (location) {
    // Via whatever way user arrived to loc,
    // pan map so that marker becomes visible.

    cardCooldown = true;
    var COOLDOWN_MSEC = 500;
    setTimeout(function () {
      cardCooldown = false;
    }, COOLDOWN_MSEC);

    mapComp.panForLocation(location);

    location.on('location_geom_changed', function () {
      // Center on the location.
      mapComp.panForLocation(location);
    });
    // The Location view will call location.off() when unbound.
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
