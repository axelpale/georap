var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var markers = tresdb.stores.markers;

var CONNECTION_ERROR = 0;
var BAD_REQUEST = 400;

module.exports = function (query) {
  // Setup
  var self = this;
  var $mount = null;
  var $elems = {};
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    $elems.locations = $mount.find('.search-locations');
    $elems.progress = $mount.find('.search-progress');

    $elems.error400 = $mount.find('.search-error-400');
    $elems.error500 = $mount.find('.search-error-500');
    $elems.errorNoConnection = $mount.find('.search-error-no-connection');

    $elems.prevPage = $mount.find('.search-prev');
    $elems.nextPage = $mount.find('.search-next');

    // Navigation buttons
    $elems.prevPage.click(function () {
      self.emit('submit', Object.assign({}, query, {
        skip: (query.skip - query.limit) < 0 ? 0 : (query.skip - query.limit),
      }));
    });
    $elems.nextPage.click(function () {
      self.emit('submit', Object.assign({}, query, {
        skip: query.skip + query.limit,
      }));
    });

    // Begin query, show progress bar
    ui.show($elems.progress);

    // Fetch one more than the limit to see if there is next page.
    // Note that this artificially changes the query.
    var extendedQuery = Object.assign({}, query, {
      limit: query.limit + 1,
    });

    // Fetch location search results.
    markers.getFiltered(extendedQuery, function (err, results) {
      // Hide progress if visible
      ui.hide($elems.progress);

      if (err) {
        // Display error
        switch (err.code) {
          case CONNECTION_ERROR:
            ui.show($elems.errorNoConnection);
            break;
          case BAD_REQUEST:
            ui.show($elems.error400);
            break;
          default:
            ui.show($elems.error500);
        }
        return;
      }

      // We must determine is there a next page.
      // We did that by fetching one additional item.
      // We do not want to render that item.

      // Hide prev and next buttons.
      // No results => hide both
      // One page or less => hide both
      // More than one page, first page => hide prev
      // More than one page, not first => show both
      var len = results.length;

      if (query.skip > 0) {
        // Not first page
        ui.show($elems.prevPage);
      } else {
        ui.hide($elems.prevPage);
      }

      if (len > query.limit) {
        // Not last page
        ui.show($elems.nextPage);
      } else {
        ui.hide($elems.nextPage);
      }

      // Render results. If there is extra item, remove it.
      // The extra item was used to determine if there is an additional
      // page or not.
      $elems.locations.html(listTemplate({
        markers: len > query.limit ? results.slice(0, -1) : results,
        placestamp: ui.placestamp,
        skip: query.skip,
        limit: query.limit,
      }));
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
    }
  };
};
