/* eslint-disable max-statements */
var template = require('./template.ejs');
var glyphiconTemplate = require('./glyphicon.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var urls = require('georap-urls-client');
var account = georap.stores.account;
var locations = georap.stores.locations;
var filterStore = georap.stores.filter;
var able = account.able;
var ableAny = account.ableAny;

module.exports = function (mapComp) {
  // Parameters:
  //   mapComp
  //     components.Map instance

  // Init
  var $mount = null;
  var self = this;
  var $elems = {};
  emitter(self);

  // Public methods

  self.bind = function ($mountEl) {
    // Add listeners to the rendered menu.
    //
    // Parameters:
    //   $mountEl
    //     The point where one should listen the events.
    //     The existence of this point in DOM is required even though
    //     it contents can be dynamically modified later, including
    //     the buttons to bind events to.
    $mount = $mountEl;

    $mount.html(template({
      glyphicon: glyphiconTemplate,
      config: georap.config,
      user: account.getUser(), // is null if not logged in
      able: able,
      ableAny: ableAny,
      isFilterActive: !filterStore.isDefault(),
      __: georap.i18n.__,
    }));

    $elems.main = $mount.find('#georap-toolbar-main');
    $elems.addition = $mount.find('#georap-toolbar-addition');
    $elems.error = $mount.find('#georap-toolbar-error');
    $elems.tooclose = $mount.find('#georap-toolbar-error-too-close');
    $elems.progress = $mount.find('#georap-toolbar-progress');

    // Menu opening.
    // To ensure that opening and closing the menu does not
    // affect click bindings, add listeners directly to $mount

    $mount.on('click', '#georap-mainmenu-btn', function () {
      // HACK update mount's gmaps-specified z-index of 0 so that
      // the zoom controls do not hide the menu on mobile screens.
      $mount.css('z-index', 1);
      // Close the sidebar whenever user opens the menu.
      return georap.go('/');
    });

    // Close the sidebar whenever user clicks the map around menu elems.
    $elems.main.click(function (ev) {
      if (ev.target === $elems.main.get(0)) {
        return georap.go('/');
      }
    });

    // Location creation

    $mount.on('click', '#georap-mainmenu-add', function (ev) {
      ev.preventDefault();

      // Hide other menus
      ui.hide($elems.main);
      // Show addition menu
      ui.show($elems.addition);
      // Hide possible error message from previous addition
      ui.hide($elems.error);

      // On addition start
      mapComp.addAdditionMarker();

      return;
    });

    $mount.on('click', '#georap-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      ui.show($elems.main);
      // Hide addition menu
      ui.hide($elems.addition);

      // On addition cancel
      mapComp.removeAdditionMarker();

      return;
    });

    $mount.on('click', '#georap-addition-create', function (ev) {
      ev.preventDefault();

      $elems.tooclose.find('button').click(function (cev) {
        // Will bind multiple times but we do not care
        cev.preventDefault();
        ui.hide($elems.tooclose);
      });

      // Show progress bar
      ui.show($elems.progress);
      // Hide addition menu
      ui.hide($elems.addition);
      // Hide possible error
      ui.hide($elems.tooclose);

      // On addition create
      var geom = mapComp.getAdditionMarkerGeom();
      mapComp.removeAdditionMarker();

      // Listen for a sign that location was creted successfully.
      locations.on('location_created', function thisFn(lev) {
        // Note: another location_created could come before.
        // Thus, off only after the same location. How to determine it?
        // Geom must be same. Author must be same. Let's use author.

        if (lev.user !== account.getName()) {
          return;
        }

        // Hide progress bar
        ui.hide($elems.progress);
        // Show main menu bar
        ui.show($elems.main);

        locations.off('location_created', thisFn); // once

        // Navigate to the new location
        georap.go(urls.locationUrl(lev.locationId));
      });

      locations.create(geom, function (err) {
        // Parameters
        //   err
        //   newLoc

        if (err) {
          if (err.message === 'TOO_CLOSE') {
            ui.show($elems.tooclose);
          } else {
            console.error(err);
            // Show error message
            ui.show($elems.error);
          }

          // Hide progress bar
          ui.hide($elems.progress);
          // Show main menu
          ui.show($elems.main);

          return;
        }
        // Otherwise wait for location_created event
      });
    });

    // Filter

    if (able('locations-filter')) {
      $elems.filter = $mount.find('#georap-mainmenu-filter');
      $elems.filterLabel = $elems.filter.find('.label');
      $elems.filter.click(ui.throttle(1000, function (ev) {
        ev.preventDefault();

        var isFilterOpen = georap.getCurrentPath() === '/filter';
        if (isFilterOpen) {
          georap.go('/');
        } else {
          georap.go('/filter');
        }
      }));

      filterStore.on('updated', function () {
        // Show a red dot when the filter is active.
        if (filterStore.isDefault()) {
          ui.hide($elems.filterLabel);
        } else {
          ui.show($elems.filterLabel);
        }
      });
    }

    // Search bar

    if (able('locations-search')) {
      $mount.on('submit', '#georap-mainmenu-search-form', function (ev) {
        ev.preventDefault();

        var searchText = $('#georap-mainmenu-search-text').val().trim();
        if (searchText.length > 0) {
          return georap.go('/search?text=' + searchText);
        }
        return georap.go('/search');
      });
    }

  };

  self.unbind = function () {
    if ($mount) {
      $mount.off('click');
      ui.offAll($elems);
      $elems = {};
      filterStore.off();
      $mount = null;
    }
  };
};
