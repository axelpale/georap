/* eslint-disable max-statements */

// Client-side routing

var account = require('../stores/account');

var CardView = require('../components/Card');
var ChangePasswordView = require('../components/ChangePassword');
var Error401View = require('../components/Error401');
var Error404View = require('../components/Error404');
var EventsView = require('../components/Events');
var ExportView = require('../components/Export');
var FiltersView = require('../components/Filters');
var InviteView = require('../components/Invite');
var LocationView = require('../components/Location');
var LoginView = require('../components/Login');
var PaymentsView = require('../components/Payments');
var PaymentsAdminView = require('../components/PaymentsAdmin');
var ResetPasswordView = require('../components/ResetPassword');
var SearchView = require('../components/Search');
var SignupView = require('../components/Signup');
var StatisticsView = require('../components/Statistics');
var UsersView = require('../components/Users');
var UserView = require('../components/User');

// Help in remembering original url if redirect to login page is required.
var AfterLogin = require('./lib/AfterLogin');

var page = require('page');
var queryString = require('qs');
var emitter = require('component-emitter');


// Emit 'map_activated' so that map knows when to pan back to original state.
emitter(exports);

exports.show = function (path) {
  // For example:
  //   routes.show('/locations/' + location._id);
  return page.show(path);
};

exports.route = function () {

  // Init

  // A card is used to display content.
  var card = new CardView();
  card.bind($('#card-layer'));
  // When card is closed, user always returns to map.
  card.on('closed', function () {
    page('/');
  });

  // Handle paths where to redirect after login.
  var afterLogin = new AfterLogin();

  // Middleware
  var adminOnly = function (context, next) {
    if (account.isAdmin()) {
      return next();
    }
    var view = new Error401View();
    card.open(view, 'page');
  };


  // Public routes first.

  page('*', function parseQueryString(context, next) {
    // Note: context.query does not have prototype. Bastard.
    var q = queryString.parse(context.querystring);

    // If querystring is empty, parse returns an object without properties.
    // Tested it.
    context.query = q;

    return next();
  });

  page('/login', function () {
    // Logout should be immediate; no reason to show progress bar.
    account.logout(function () {
      var view = new LoginView(function onSuccess() {
        // After successful login, go to original path.
        page.show(afterLogin.get());
        // Reset for another login during the same session.
        afterLogin.reset();
      });
      card.open(view, 'full');
    });
  });

  page('/reset/:token', function (context) {
    var token = context.params.token;
    var view = new ResetPasswordView(token, function success() {
      page.show('/login');
    });
    card.open(view, 'full');
  });

  page('/signup/:token', function (context) {
    var token = context.params.token;
    var view = new SignupView(token, function success() {
      page.show('/login');
    });
    card.open(view, 'full');
  });

  // Backwards compatiblity with v1 invite URLs
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
    // If not logged in then show login form.

    if (account.isLoggedIn()) {
      return next();
    }

    // Remember original requested path and redirect to it after login
    afterLogin.set(context);

    page.show('/login');
  });

  page('/', function () {
    // Map is always open on the background.
    // Infinite loop prevention:
    //   Do not emit 'closed' event because it causes redirection to '/'
    var silent = true;
    card.close(silent);
    exports.emit('map_routed');
  });

  page('/payments', function () {
    var view = new PaymentsView();
    card.open(view, 'page');
  });

  page('/password', function () {
    var view = new ChangePasswordView();
    card.open(view, 'page');
  });

  page('/latest', function () {
    var view = new EventsView();
    card.open(view);
  });

  page('/locations/:id', function (ctx) {
    var view = new LocationView(ctx.params.id);
    card.open(view);
    view.once('idle', function (location) {
      exports.emit('location_routed', location);
    });
  });

  page('/filters', function () {
    var view = new FiltersView();
    card.open(view);
  });

  page('/search', function (ctx) {
    var view = new SearchView(ctx.query);
    card.open(view);
  });

  page('/users', function () {
    var view = new UsersView();
    card.open(view);
  });

  page('/users/:username', function (ctx) {
    var view = new UserView(ctx.params.username);
    card.open(view);
  });

  page('/export', function () {
    card.open(new ExportView());
  });

  // Routes that require admin

  page('/invite', adminOnly, function () {
    var view = new InviteView();
    card.open(view, 'page');
  });

  page('/payments/admin', adminOnly, function () {
    var view = new PaymentsAdminView();
    card.open(view, 'page');
  });

  page('/statistics', adminOnly, function () {
    var view = new StatisticsView();
    card.open(view, 'page');
  });

  // Catch all

  page('*', function () {
    // Page not found.
    var view = new Error404View();
    card.open(view, 'page');
  });

  page.start();
};
