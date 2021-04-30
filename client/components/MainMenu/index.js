/* eslint-disable max-statements */
var template = require('./template.ejs');
var glyphiconTemplate = require('./glyphicon.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var account = tresdb.stores.account;
var locations = tresdb.stores.locations;
var filterStore = tresdb.stores.filter;

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
      supportButtonTitle: tresdb.config.supportButtonTitle,
      isFilterActive: !filterStore.isDefault(),
    }));

    _$root = $mount;

    // Menu opening

    $mount.on('click', '#tresdb-mainmenu', function () {
      // Close the sidebar whenever user opens the menu.
      return tresdb.go('/');
    });

    // Location manipulation

    $mount.on('click', '#tresdb-mainmenu-add', function (ev) {
      ev.preventDefault();

      // Hide other menus
      ui.hide($('#tresdb-toolbar-main'));
      // Show addition menu
      ui.show($('#tresdb-toolbar-addition'));

      // Hide possible error message from previous addition
      ui.hide($('#tresdb-toolbar-error'));

      // On addition start
      mapComp.addAdditionMarker();

      return;
    });

    $mount.on('click', '#tresdb-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      ui.show($('#tresdb-toolbar-main'));
      // Hide addition menu
      ui.hide($('#tresdb-toolbar-addition'));

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
        ui.hide($tooCloseError);
      });

      // Show progress bar
      ui.show($('#tresdb-toolbar-progress'));
      // Hide addition menu
      ui.hide($('#tresdb-toolbar-addition'));
      // Hide possible error
      ui.hide($tooCloseError);

      // On addition create
      var geom = mapComp.getAdditionMarkerGeom();
      mapComp.removeAdditionMarker();

      // Listen for a sign that location was creted successfully.
      locations.on('location_created', function thisFn(lev) {
        // Note: another location_created could come before.
        // Thus, off only after the same location. How to determine it?
        // Geom must be same. Creator must be same. Let's use creator.

        if (lev.user !== account.getName()) {
          return;
        }

        // Hide progress bar
        ui.hide($('#tresdb-toolbar-progress'));

        // Show main menu
        ui.show($('#tresdb-toolbar-main'));

        locations.off('location_created', thisFn);
      });

      locations.create(geom, function (err) {
        // Parameters
        //   err
        //   newLoc

        if (err) {
          if (err.message === 'TOO_CLOSE') {
            ui.show($tooCloseError);
          } else {
            console.error(err);
            // Show error message
            ui.show($('#tresdb-toolbar-error'));
          }

          // Hide progress bar
          ui.hide($('#tresdb-toolbar-progress'));

          // Show main menu
          ui.show($('#tresdb-toolbar-main'));

          return;
        }
        // Otherwise wait for location_created event
      });
    });

    // Filter

    var filterTimer = true; // start without burn-in period
    $mount.on('click', '#tresdb-mainmenu-filter', function (ev) {
      ev.preventDefault();

      var isFilterOpen = tresdb.getCurrentPath() === '/filter';

      if (isFilterOpen) {
        if (filterTimer) {
          filterTimer = false;
          tresdb.go('/');
        }
      } else {
        // Delay to prevent immediate double click open close.
        var SEC = 1000;
        setTimeout(function () {
          filterTimer = true;
        }, SEC);
        tresdb.go('/filter');
      }
    });

    filterStore.on('updated', function () {
      // Show a red dot when the filter is active.
      if (filterStore.isDefault()) {
        ui.hide($('#tresdb-mainmenu-filter .label'));
      } else {
        ui.show($('#tresdb-mainmenu-filter .label'));
      }
    });


    // Search bar

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
    filterStore.off();
  };
};
