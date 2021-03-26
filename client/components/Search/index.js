// Component for search form and results.

var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var webResultsTemplate = require('./webresults.ejs');
var emitter = require('component-emitter');
var queryString = require('query-string');
var ui = require('tresdb-ui');
var markers = tresdb.stores.markers;
var searchApi = tresdb.stores.search;

var FOCUS_DELAY = 200;
var BAD_REQUEST = 400;

var SKIP_DEFAULT = 0;
var LIMIT_DEFAULT = 50;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring

  // Init
  var self = this;
  emitter(self);

  // Define submitHandler out of bind for it to be unbindable.
  var _submitHandler;

  // Add default values to query if missing
  if (!('skip' in query)) {
    query.skip = SKIP_DEFAULT;
  }
  if (!('limit' in query)) {
    query.limit = LIMIT_DEFAULT;
  }

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      username: tresdb.stores.account.getName(),
    }));

    var $form = $('#tresdb-search-form');
    var $progress = $('#tresdb-search-progress');
    var $text = $('#tresdb-search-text');
    var $creator = $('#tresdb-search-creator');
    var $order = $('#tresdb-search-order');
    var $results = $('#tresdb-search-results');
    var $error400 = $('#tresdb-search-400');
    var $error500 = $('#tresdb-search-500');
    var $skip = $('#tresdb-search-skip');
    var $limit = $('#tresdb-search-limit');
    var $prevPage = $('#tresdb-search-prev');
    var $nextPage = $('#tresdb-search-next');

    // Load additional users into the form
    tresdb.stores.users.getAll(function (err, users) {
      if (err) {
        // Fail quietly, not so important
        return;
      }

      var myName = tresdb.stores.account.getName();

      $creator.append('<option disabled>───────</option>');

      // 1 Sort alphabetically.
      // 2 Exlude user's own name because it is there already.
      // 3 Add option element for each remaining user. Trim long names.
      users.sort(function (a, b) {
        return a < b ? 1 : -1;
      }).filter(function (u) {
        return u.name !== myName;
      }).forEach(function (u) {
        var short = u.name;
        var LIMIT = 12;
        if (short.length > LIMIT) {
          short = u.name.substring(0, LIMIT) + '...';
        }
        var opt = '<option value="' + u.name + '">' + short + '</option>';
        $creator.append(opt);

      });

      // Reselect correct creator because these were just loaded.
      if ('creator' in query) {
        // TODO Check that creator exists in list. User can typo
        $creator.val(query.creator);
      }
    });

    _submitHandler = function (ev) {
      // Form submit reloads the view by a new URL.

      if (ev) {
        ev.preventDefault();
      }

      // User easily inputs additional newlines
      // because the user cannot see them.
      var text = $text.val().trim();
      var creator = $creator.val();
      var order = $order.val();
      var skip = $skip.val();
      var limit = $limit.val();

      var queryObj = {};

      if (text.length > 0) {
        queryObj.text = text;
      }

      if (creator !== 'anyone') {
        queryObj.creator = creator;
      }

      queryObj.order = order;
      queryObj.skip = skip;
      queryObj.limit = limit;

      // Reload view with new url.
      tresdb.go('/search?' + queryString.stringify(queryObj));
    };

    (function defineSubmitters() {
      // On form submit, or change of filters, or page change
      // alter URL query parameters and reload the view.
      // The search request is sent after the reload.
      $form.submit(_submitHandler);
      $creator.change(_submitHandler);
      $order.change(_submitHandler);
      $prevPage.click(function (ev) {
        var x = parseInt($skip.val(), 10);
        var w = parseInt($limit.val(), 10);

        if (x - w < 0) {
          $skip.val(0);
        } else {
          $skip.val(x - w);
        }

        _submitHandler(ev);
      });
      $nextPage.click(function (ev) {
        var x = parseInt($skip.val(), 10);
        var w = parseInt($limit.val(), 10);
        $skip.val(x + w);
        _submitHandler(ev);
      });
    }());

    // Init the form.
    (function initFormByQuery(q) {
      // Init the form piece by piece

      if ('text' in q) {
        $text.val(q.text.trim());
      }

      if ('creator' in q) {
        // TODO Check that creator exists in list. User can typo
        $creator.val(q.creator);
      }

      if ('order' in q) {
        $order.val(q.order);
      }

      if ('skip' in q) {
        $skip.val(q.skip);
      } else {
        $skip.val(SKIP_DEFAULT);
      }

      if ('limit' in q) {
        $limit.val(q.limit);
      } else {
        $limit.val(LIMIT_DEFAULT);
      }

    }(query));

    // Do instant query.
    (function doQuery(q) {
      // Parameters:
      //   q
      //     skip: <number>
      //     limit: <number>
      //     order: 'rel' | 'az' | 'za' | 'newest' | 'oldest'
      //     search: <text>
      //
      // DEBUG console.log('q', q);
      //
      // Show progress bars
      ui.show($progress);
      var $searchProgress = $mount.find('.search-web-progress');
      ui.show($searchProgress);

      // Fetch geocoder results when map has finished loading.
      searchApi.geocode(q.text, function (err, results) {
        ui.hide($searchProgress);
        if (err) {
          ui.show($mount.find('.search-web-error'));
          return;
        }
        $mount.find('.search-web-results').html(webResultsTemplate({
          // array of { address_components: [ { long_name, short_name }] }
          results: results,
        }));
      });

      // Fetch location search results.
      // Fetch one more than the limit to see if there is next page.
      // Note that this artificially changes the query.
      q.limit = parseInt(q.limit, 10) + 1;
      markers.getFiltered(q, function responseHandler(err, results) {
        // Hide progress if visible
        ui.hide($progress);

        if (err) {
          // Display error
          console.error(err);
          if (err.code === BAD_REQUEST) {
            ui.show($error400);
          } else {
            ui.show($error500);
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
        var l = results.length;
        var skip = $skip.val();
        var limit = $limit.val();

        if (skip > 0) {
          // Not first page
          ui.show($prevPage);
        } else {
          ui.hide($prevPage);
        }

        if (l > limit) {
          // Not last page
          ui.show($nextPage);
        } else {
          ui.hide($nextPage);
        }

        // Render results. If there is extra item, remove it.
        // The extra item was used to determine if there is an additional
        // page or not.
        $results.html(listTemplate({
          markers: l > limit ? results.slice(0, -1) : results,
          placestamp: ui.placestamp,
        }));
      });
    }(query));

    // If query is empty focus to the search input field
    // because user probably did arrive here manually and not by
    // submitting the form.
    // Test this against order because it is always attached.
    if (!('order' in query)) {
      setTimeout(function () {
        $text.focus();
      }, FOCUS_DELAY);
    }
  };  // end bind


  this.unbind = function () {
    $('#tresdb-search-form').off();
  };

};
