// Root bus
var bus = require('georap-bus');
var socket = require('./connection/socket');

// Collect data access API's under tresdb global.
// This prevents cumbersome ../../../ requires.
// The tresdb global is defined in index.html
var stores = require('./stores');

// The html contains tresdb object,
// preset with some config.
// Let us append the stores to the global namespace.
tresdb.stores = stores;

// Use following stores here
var account = stores.account;
var theme = stores.theme;

// Theme setup
var applyTheme = function (state) {
  var linkEl = document.getElementById('theme-stylesheet');
  linkEl.setAttribute('href', '/assets/themes/' + state.colorScheme + '.css');
  var metaEl = document.getElementById('theme-color');
  metaEl.setAttribute('content', state.themeColor);
};
theme.on('updated', applyTheme);
applyTheme(theme.get());

// Routes and main components.
var routes = require('./routes');
var MapComp = require('./components/Map');
var MainMenuComp = require('./components/MainMenu');


// Collect helpers under georap and tresdb global.
tresdb.go = routes.show;  // go to path. very general, thus exposed globally
tresdb.getCurrentPath = routes.getCurrentPath;  // query current page

// Define routes

routes.route();

// Emit socket events to bus.

var handleEvent = function (ev) {
  // Emit all location events. Allow hooking to all location events or
  // specific event type e.g. location_created, needed by main menu to
  // determine when creation is successful.
  bus.emit(ev.type, ev);
  bus.emit('socket_event', ev);
};
socket.on('tresdb_event', handleEvent); // legacy
socket.on('georap_event', handleEvent);


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

    // Prevent double-click open-close
    cardCooldown = true;
    var COOLDOWN_MSEC = 500;
    setTimeout(function () {
      cardCooldown = false;
    }, COOLDOWN_MSEC);

    mapComp.panForCard(location.getGeom());

    location.on('location_geom_changed', function () {
      // Center on the location.
      mapComp.panForCard(location.getGeom());
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
