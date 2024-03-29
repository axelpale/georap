var socket = require('./connection/socket');
var storage = require('./connection/storage');
var bus = require('georap-bus');
var urls = require('georap-urls-client');

// Collect data access API's under georap global.
// This prevents cumbersome ../../../ requires.
// The georap global is defined in index.html
// Lecacy name: tresdb
var stores = require('./stores');

// The html contains georap object,
// preset with some config.
// Let us append the stores to the global namespace.
georap.stores = stores;

georap.createStore = function (id, initial, reducer) {
  var state = Object.assign({}, initial);

  var hydrate = storage.getItem('georap.' + id);
  if (hydrate) {
    state = JSON.parse(hydrate);
  }

  return {
    getState: function () {
      return state;
    },
    emit: function (ev) {
      // Update state
      state = reducer(state, ev);
      // Save new state
      storage.setItem('georap.' + id, JSON.stringify(state));
    },
  };
};

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


// Collect helpers under georap global.
// Global translation helper
georap.i18n.__ = require('./i18n').__;
// Routing helpers
georap.go = routes.show;  // go to path. very general, thus exposed globally
georap.getCurrentPath = routes.getCurrentPath;  // query current page


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
    var locPath = urls.locationUrl(mloc._id);

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

  var onAuthEvent = function () {
    // Refresh main menu when user arrives or changes role.
    // Menu component checks capabilities internally.
    mapComp.removeControls();
    mapComp.addControl(menuComp);
    // Geolocation
    if (account.able('map-geolocation')) {
      mapComp.addGeolocationButton();
    } else {
      mapComp.removeGeolocationButton();
    }
    // Location markers
    if (account.able('locations-read')) {
      mapComp.startLoadingMarkers();
      mapComp.startLoadingFlags();
    } else {
      mapComp.stopLoadingFlags();
      mapComp.stopLoadingMarkers();
      mapComp.removeAllMarkers();
    }
    // Socket listening
    if (account.able('socket-events')) {
      socket.start();
    } else {
      socket.stop();
    }
  };

  // Bind map functionality to auth events.
  bus.on('login', onAuthEvent);
  bus.on('logout', onAuthEvent);
  // Initial functionality setup
  onAuthEvent();
};
