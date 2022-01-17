/* eslint-disable max-statements, max-lines */

// Client-side routing

var CardView = require('../components/Card');
var Error401View = require('../components/Error401');
var Error404View = require('../components/Error404');
var LoginView = require('../components/Login');
var SupportFundView = require('../components/SupportFund');

// Help in remembering original url if redirect to login page is required.
var AfterLogin = require('./lib/AfterLogin');

var page = require('page');
var queryString = require('qs');
var emitter = require('component-emitter');

// Stores
var config = georap.config;
var account = georap.stores.account;
var mapStateStore = georap.stores.mapstate;

// Emit 'map_activated' so that map knows when to pan back to original state.
emitter(exports);

exports.show = function (path) {
  // For example:
  //   routes.show('/locations/' + location._id);
  return page.show(path);
};

exports.getCurrentPath = function () {
  // Return current path string.
  return page.current;
};

exports.route = function () {
  // Init. Called once at startup.

  // A card is used to display content.
  var card = new CardView();
  card.bind($('#card-layer'));

  // When card is closed, user always returns to map.
  card.on('closed', function () {
    page('/');
  });

  // Handle paths where to redirect after login.
  var afterLogin = new AfterLogin();

  // Dynamic imports might fail
  var importErrorHandler = function (err) {
    console.error(err);
  };

  // Middleware

  var basicViewSetup = function (importer) {
    // Minimal setup for a card page that is loaded with Webpack's lazy import.
    // There are many pages that cannot use this basic setup due to
    // additional configuration.
    return function () {
      // General view handler function.
      importer()
        .then(function (moduleWrap) {
          var View = moduleWrap.default;
          card.open(new View());
        })
        .catch(importErrorHandler);
    };
  };

  var adminOnly = function (context, next) {
    if (account.isAdmin()) {
      return next();
    }
    var view = new Error401View();
    card.open(view, 'medium');
  };


  ///////////////////////
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
      // After successful login, go to original url.
      // Reset for another login during the same session.
      var urlAfterLogin = afterLogin.get();
      afterLogin.reset();

      var view = new LoginView(urlAfterLogin);
      card.open(view, config.loginPageSize);
    });
  });

  page('/reset/:token', function (context) {
    import(
      /* webpackChunkName: "reset-password" */
      '../components/ResetPassword'
    )
      .then(function (moduleWrap) {
        var token = context.params.token;
        var ResetPasswordView = moduleWrap.default;
        var view = new ResetPasswordView(token, function success() {
          page.show('/login');
        });
        card.open(view, 'full');
      })
      .catch(importErrorHandler);
  });

  page('/signup/:token', function (context) {
    import(
      /* webpackChunkName: "signup-view" */
      '../components/Signup'
    )
      .then(function (moduleWrap) {
        var token = context.params.token;
        var SignupView = moduleWrap.default;
        var view = new SignupView(token, function success() {
          page.show('/login');
        });
        card.open(view, 'full');
      })
      .catch(importErrorHandler);
  });

  page('/uploads/*', function (context) {
    // Prevent page.js routing links of uploads
    // See https://github.com/visionmedia/page.js/issues/566
    page.stop();
    context.handled = false;
    window.location.href = context.canonicalPath;
  });

  /////////////////////////////
  // Private routes i.e. routes that require login
  //

  page('*', function (context, next) {
    // If not logged in then show login form.

    if (account.isLoggedIn()) {
      return next();
    }

    // Remember original requested path and redirect to it after login
    afterLogin.set(context);

    page.show('/login');
  });

  page('*', function (context, next) {
    // Recenter map to possible query parameters.
    //
    var q = context.query;
    var s, lat, lng, zoom;

    if (q.lat || q.lng || q.zoom) {
      s = {};
      if (q.lat) {
        lat = parseFloat(q.lat);
        if (!isNaN(lat)) {
          s.lat = lat;
        }
      }
      if (q.lng) {
        lng = parseFloat(q.lng);
        if (!isNaN(lng)) {
          s.lng = lng;
        }
      }
      if (q.zoom) {
        zoom = parseInt(q.zoom, 10);
        if (!isNaN(zoom)) {
          s.zoom = zoom;
        }
      }
      mapStateStore.update(s);
    }

    return next();
  });

  page('/', function () {
    // Map is always open on the background.
    // Infinite loop prevention:
    //   Do not emit 'closed' event because it causes redirection to '/'
    var silent = true;
    card.close(silent);
    exports.emit('map_routed');
  });

  page('/account', function () {
    import(
      /* webpackChunkName: "account-view" */
      '../components/Account'
    )
      .then(function (moduleWrap) {
        var AccountView = moduleWrap.default;
        card.open(new AccountView());
      })
      .catch(importErrorHandler);
  });

  page('/account/email', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "account-Email" */
      '../components/Account/ChangeEmail'
    );
  }));

  page('/account/password', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "account-password" */
      '../components/Account/ChangePassword'
    );
  }));

  page('/filter', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "filter-view" */
      '../components/Filter'
    );
  }));

  page('/export', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "export-view" */
      '../components/Export'
    );
  }));

  page('/import', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "import-view" */
      '../components/Import'
    );
  }));

  page('/import/:batchId/outcome', function (ctx) {
    import(
      /* webpackChunkName: "batch-outcome" */
      '../components/BatchOutcome'
    )
      .then(function (moduleWrap) {
        var BatchOutcomeView = moduleWrap.default;
        card.open(new BatchOutcomeView(ctx.params.batchId));
      })
      .catch(importErrorHandler);
  });

  page('/import/:batchId', function (ctx) {
    import(
      /* webpackChunkName: "batch-preview" */
      '../components/BatchPreview'
    )
      .then(function (moduleWrap) {
        var BatchPreview = moduleWrap.default;
        card.open(new BatchPreview(ctx.params.batchId));
      })
      .catch(importErrorHandler);
  });

  page('/latest', function () {
    // NOTE Code for future
    // // Prevent reopen on hash change
    // if (card.isViewInstanceOf(LatestView)) {
    //   return;
    // }
    import(
      /* webpackChunkName: "latest-view" */
      '../components/Latest'
    )
      .then(function (moduleWrap) {
        var LatestView = moduleWrap.default;
        card.open(new LatestView());
      })
      .catch(importErrorHandler);
  });

  page('/locations/:id', function (ctx) {
    import(
      /* webpackChunkName: "location" */
      '../components/Location'
    )
      .then(function (moduleWrap) {
        var LocationView = moduleWrap.default;
        var view = new LocationView(ctx.params.id, ctx.query);
        card.open(view);

        // Inform that location page has loaded. Map will pan so that
        // the location becomes centered at the visible portion.
        view.once('idle', function (location) {
          exports.emit('location_routed', location);
        });
      })
      .catch(importErrorHandler);
  });

  page('/crosshair', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "crosshair-view" */
      '../components/Crosshair'
    );
  }));

  page('/search', function (ctx) {
    import(
      /* webpackChunkName: "search-view" */
      '../components/Search'
    )
      .then(function (moduleWrap) {
        var SearchView = moduleWrap.default;
        card.open(new SearchView(ctx.query));
      })
      .catch(importErrorHandler);
  });

  page('/statistics', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "statistics" */
      '../components/Statistics'
    );
  }));

  page('/fund', function () {
    var view = new SupportFundView();
    card.open(view);
  });

  page('/users', basicViewSetup(function () {
    return import(
      /* webpackChunkName: "users" */
      '../components/Users'
    );
  }));

  page('/users/:username', function (ctx) {
    import(
      /* webpackChunkName: "user" */
      '../components/User'
    )
      .then(function (moduleWrap) {
        var UserView = moduleWrap.default;
        card.open(new UserView(ctx.params.username));
      })
      .catch(importErrorHandler);
  });


  //////////////////
  // Routes that require admin. Note the adminOnly middleware.
  //

  page('/admin/users', adminOnly, basicViewSetup(function () {
    return import(
      /* webpackChunkName: "admin-users" */
      '../components/Admin/Users'
    );
  }));

  page('/admin/users/:username', adminOnly, function (ctx) {
    import(
      /* webpackChunkName: "admin-user" */
      '../components/Admin/Users/User'
    )
      .then(function (moduleWrap) {
        var AdminUserView = moduleWrap.default;
        var view = new AdminUserView(ctx.params.username);
        card.open(view);
      })
      .catch(importErrorHandler);
  });

  page('/invite', adminOnly, basicViewSetup(function () {
    return import(
      /* webpackChunkName: "invite-view" */
      '../components/Invite'
    );
  }));

  // Catch all

  page('*', function () {
    // Page not found.
    var view = new Error404View();
    card.open(view, 'medium');
  });

  page.start();
};
