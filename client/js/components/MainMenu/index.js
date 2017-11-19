
var account = require('../../stores/account');
var locations = require('../../stores/locations');
var template = require('./template.ejs');
var glyphiconTemplate = require('./glyphicon.ejs');
var emitter = require('component-emitter');

// var isGeomAlmostEqual = function (geom1, geom2) {
//   var prec = 5;
//
//   var lat1 = geom1.coordinates[1];
//   var lng1 = geom1.coordinates[0];
//   var lat2 = geom2.coordinates[1];
//   var lng2 = geom2.coordinates[0];
//
//   lat1 = lat1.toString().substr(0, prec);
//   lng1 = lng1.toString().substr(0, prec);
//   lat2 = lat2.toString().substr(0, prec);
//   lng2 = lng2.toString().substr(0, prec);
//
//   return (lat1 === lat2 && lng1 === lng2);
// };

module.exports = function (mapComp) {
  // Parameters:
  //   mapComp
  //     components.Map instance

  // Init
  var self = this;
  emitter(self);

  // Root element. Remember for the unbinding.
  var _$root = null;

  // Public methods

  self.bind = function ($mount) {
    // Add listeners to the rendered menu.
    //
    // Parameters:
    //   $mount
    //     The point where one should listen the events.
    //     The existence of this point in DOM is required even though
    //     it contents can be dynamically modified later, including
    //     the buttons to bind events to.

    $mount.html(template({
      glyphicon: glyphiconTemplate,
      config: tresdb.config,
      user: account.getUser(),  // might be undefined
    }));

    _$root = $mount;

    // Location manipulation

    $mount.on('click', '#tresdb-mainmenu-add', function (ev) {
      ev.preventDefault();

      // Hide other menus
      $('#tresdb-toolbar-main').addClass('hidden');
      // Show addition menu
      $('#tresdb-toolbar-addition').removeClass('hidden');

      // Hide possible error message from previous addition
      $('#tresdb-toolbar-error').addClass('hidden');

      // On addition start
      mapComp.addAdditionMarker();

      return;
    });

    $mount.on('click', '#tresdb-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-main').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      // On addition cancel
      mapComp.removeAdditionMarker();

      return;
    });

    $mount.on('click', '#tresdb-addition-create', function (ev) {
      ev.preventDefault();

      var $tooCloseError = $('#tresdb-toolbar-error-too-close');
      $tooCloseError.find('button').click(function (cev) {
        // Will bind multiple times but we do not care
        cev.preventDefault();
        tresdb.ui.hide($tooCloseError);
      });

      // Show progress bar
      $('#tresdb-toolbar-progress').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');
      // Hide possible error
      tresdb.ui.hide($tooCloseError);

      // On addition create
      var geom = mapComp.getAdditionMarkerGeom();
      mapComp.removeAdditionMarker();

      // Listen for a sing that location was creted successfully.
      locations.on('location_created', function thisFn(lev) {
        // Note: another location_created could come before.
        // Thus, off only after the same location. How to determine it?
        // Geom must be same. Creator must be same. Let's use creator.

        if (lev.user !== account.getName()) {
          return;
        }

        // Hide progress bar
        $('#tresdb-toolbar-progress').addClass('hidden');

        // Show main menu
        $('#tresdb-toolbar-main').removeClass('hidden');

        locations.off('location_created', thisFn);
      });

      locations.create(geom, function (err) {
        // Parameters
        //   err
        //   newLoc

        if (err) {
          if (err.message === 'TOO_CLOSE') {
            tresdb.ui.show($tooCloseError);
          } else {
            console.error(err);
            // Show error message
            $('#tresdb-toolbar-error').removeClass('hidden');
          }

          // Hide progress bar
          $('#tresdb-toolbar-progress').addClass('hidden');

          // Show main menu
          $('#tresdb-toolbar-main').removeClass('hidden');

          return;
        }
        // Otherwise wait for location_created event
      });
    });


    // Listings and resources

    $mount.on('click', '#tresdb-mainmenu-events', function (ev) {
      ev.preventDefault();

      return tresdb.go('/latest');
    });

    $mount.on('click', '#tresdb-mainmenu-users', function (ev) {
      ev.preventDefault();

      return tresdb.go('/users');
    });

    $mount.on('click', '#tresdb-mainmenu-locations', function (ev) {
      ev.preventDefault();
      return tresdb.go('/search');
    });

    // Export / import

    $mount.on('click', '#tresdb-mainmenu-import', function (ev) {
      ev.preventDefault();
      return tresdb.go('/import');
    });

    $mount.on('click', '#tresdb-mainmenu-export', function (ev) {
      ev.preventDefault();
      return tresdb.go('/export');
    });


    // Account

    $mount.on('click', '#tresdb-mainmenu-user', function (ev) {
      ev.preventDefault();
      return tresdb.go('/users/' + account.getName());
    });

    $mount.on('click', '#tresdb-mainmenu-change-password', function (ev) {
      ev.preventDefault();
      return tresdb.go('/password');
    });


    // Admin stuff

    $mount.on('click', '#tresdb-mainmenu-invite', function (ev) {
      ev.preventDefault();
      return tresdb.go('/invite');
    });

    $mount.on('click', '#tresdb-mainmenu-users-admin', function (ev) {
      ev.preventDefault();
      return tresdb.go('/admin/users');
    });

    $mount.on('click', '#tresdb-mainmenu-statistics', function (ev) {
      ev.preventDefault();
      return tresdb.go('/statistics');
    });


    // Logout

    $mount.on('click', '#tresdb-mainmenu-logout', function (ev) {
      ev.preventDefault();

      return tresdb.go('/login');
    });


    // External tools

    $mount.on('submit', '#tresdb-mainmenu-search-form', function (ev) {
      ev.preventDefault();

      var searchText = $('#tresdb-mainmenu-search-text').val().trim();
      if (searchText.length > 0) {
        return tresdb.go('/search?text=' + searchText);
      }
      return tresdb.go('/search');
    });

  };

  self.unbind = function () {
    if (_$root !== null) {
      _$root.off('click');
    }
  };
};
