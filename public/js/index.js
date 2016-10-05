
var io = require('socket.io-client');
var auth = require('./auth');
var locations = require('./locations');
var mapstate = require('./mapstate');
var navigation = require('./navigation');
var maps = require('./maps');
var menus = require('./menus');
var cards = require('./cards');
var forms = require('./forms');
var routers = require('./routers');


// Websocket connection and connection error handling
var socket = io('/');

socket.on('connect-error', function () {
  console.error('TresDB: io connect-error');
});


// Authentication API
var authService = new auth.Service(socket, window.localStorage);


// Locations API
var locationsService = new locations.Service(socket, authService);


// A card can be used to display content.
var card = new cards.Controller();


// Set up routes
var navService = new navigation.Service();
var router = new routers.Router(navService);

router.route('login', function () {
  authService.logout(function () {
    // Should be immediate; no reason to show progress bar.
    var loginForm = new forms.Login(router, authService);

    card.open(loginForm.render(), 'full');
    loginForm.bind();
  });
});

router.route('map', function () {
  // Map is always open on the background.
  card.close();
});

router.route('changePassword', function () {
  var changePasswordForm = new forms.ChangePassword(authService);

  card.open(changePasswordForm.render(), 'page');
  changePasswordForm.bind();
});

router.route('invite', function () {
  var inviteForm = new forms.Invite(authService);

  card.open(inviteForm.render(), 'page');
  inviteForm.bind();
});

router.route('resetPassword', function () {
  var token = navService.hash.get('reset');
  var resetPasswordForm = new forms.ResetPassword(router, authService, token);

  card.open(resetPasswordForm.render(), 'full');
  resetPasswordForm.bind();
});

router.route('signup', function () {
  var token = navService.hash.get('invite');
  var signupForm = new forms.Signup(router, authService, token);

  card.open(signupForm.render(), 'full');
  signupForm.bind();
});


// Function initMap is called as jsonp call after Google Maps JS script is
// loaded. Lay the main menu immediately on the map.
window.initMap = function () {
  var mapElement = document.getElementById('map');

  // Remember map view state (center, zoom, type...)
  // Default to southern Finland.
  //
  // Rules:
  // - Whenever user's location on the map changes, the new location
  //   should be stored device-wise.
  // - On a fresh session, try to retrieve geolocation from the browser.
  // - If no location is stored and none can be retrieved from the browser,
  //   fallback to southern finland.
  //
  var mapstateStore = new mapstate.Store(window.localStorage);
  var mapstateService = new mapstate.Service(mapstateStore, {
    // Default map state
    lat: 61.0,
    lng: 24.0,
    zoom: 6,
    // 'hybrid' is darker and more practical than 'roadmap'
    mapTypeId: 'hybrid',
  });

  var defaultMapstate = mapstateService.getState();
  var mapController = new maps.Controller(mapElement, defaultMapstate);

  mapstateService.listen(mapController.getMap());

  var addMainMenu = function () {
    var mainMenu = new menus.MainMenu(router, authService);

    mapController.addControl(mainMenu.render(), function (root) {
      // Special bind handling: addControl cannot add content to dom instantly.
      mainMenu.bind(root);
    });
  };

  var addLocations = function () {
    locationsService.fetchAll(function (err, locs) {
      if (err) {
        console.error(err);

        return;
      }  // else

      mapController.locations.add(locs);
    });
  };

  // Bind menu to auth events.
  authService.on('login', addMainMenu);
  authService.on('logout', function () {
    mapController.removeControls();
  });

  // Bind map locations to auth events.
  authService.on('login', addLocations);
  authService.on('logout', function () {
    mapController.locations.removeAll();
  });

  // Init mainmenu and locations if user logged in
  if (authService.isLoggedIn()) {
    addLocations();
    addMainMenu();
  }

};


// What to show first:
//   If about to reset password
//     Show reset form.
//   If arrived through invite link
//     Show set account form.
//   If not logged in
//     Show login form
if (navService.hash.has('reset')) {
  // User has reseted a password. Display password reset form.
  router.go('resetPassword');
} else if (navService.hash.has('invite')) {
  // User has been invited. Display sign up form.
  router.go('signup');
} else if (authService.isLoggedIn()) {
  // Logged in user goes straight to map.
  router.go('map');
} else {
  // Display login form and hide the map under it.
  router.go('login');
}
