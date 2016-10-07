
var io = require('socket.io-client');
var page = require('page');
var queryString = require('query-string');

var auth = require('./auth');
var locations = require('./locations');
var mapstate = require('./mapstate');
var maps = require('./maps');
var menus = require('./menus');
var cards = require('./cards');
var forms = require('./forms');


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
var card = new cards.Controller(function onUserClose() {
  page.show('/');
});


//// Routes ////

// State

var afterLogin = (function () {
  var DEFAULT_PATH = '/';
  var path = DEFAULT_PATH;

  return {
    get: function () {
      return path;
    },
    set: function (ctx) {
      path = ctx.canonicalPath;
    },
    reset: function () {
      path = DEFAULT_PATH;
    },
  };
}());


// Public routes first.

page('*', function parseQueryString(context, next) {
  // Note: context.query does not have prototype. Bastard.
  var q = queryString.parse(context.querystring);

  // If querystring is empty, parse returns object without properties. Tested.
  context.query = q;
  next();
});

page('/login', function () {
  // Logout should be immediate; no reason to show progress bar.
  authService.logout(function () {
    var loginForm = new forms.Login(authService, function onSuccess() {
      // After successful login, go to original path.
      page.show(afterLogin.get());
      // Reset for another login during the same session.
      afterLogin.reset();
    });

    card.open(loginForm.render(), 'full');
    loginForm.bind();
  });
});

page('/reset/:token', function (context) {
  var token = context.params.token;
  var form = new forms.ResetPassword(authService, token, function success() {
    page.show('/login');
  });

  card.open(form.render(), 'full');
  form.bind();
});

page('/signup/:token', function (context) {
  var token = context.params.token;
  var signupForm = new forms.Signup(authService, token, function success() {
    page.show('/login');
  });

  card.open(signupForm.render(), 'full');
  signupForm.bind();
});

// Backwards compatiblity: invite URLs
page('*', function (context, next) {
  var q = context.query;

  if ('invite' in q) {
    return page.show('/signup/' + q.invite);
  }  // else

  if ('reset' in q) {
    return page.show('/reset/' + q.reset);
  }  // else

  return next();
});

// Routes that require login

page('*', function (context, next) {
  //   If not logged in
  //     Show login form
  if (authService.isLoggedIn()) {
    return next();
  }  // else

  // Remember original path
  afterLogin.set(context);

  page.show('/login');
});

page('/', function () {
  // Map is always open on the background.
  card.close();
});

page('/password', function () {
  var changePasswordForm = new forms.ChangePassword(authService);

  card.open(changePasswordForm.render(), 'page');
  changePasswordForm.bind();
});

page('/invite', function () {
  var inviteForm = new forms.Invite(authService);

  card.open(inviteForm.render(), 'page');
  inviteForm.bind();
});

//page('*', function () {
//  page('/');
//});

page.start();


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
    var mainMenu = new menus.MainMenu(authService, function go(path) {
      return page.show(path);
    });

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
