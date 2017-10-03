// Component for search form and results.

var markers = require('../../stores/markers');
var tagsTemplate = require('../Location/Tags/tagsList.ejs');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');
var queryString = require('query-string');

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
  if (!query.hasOwnProperty('skip')) {
    query.skip = SKIP_DEFAULT;
  }
  if (!query.hasOwnProperty('limit')) {
    query.limit = LIMIT_DEFAULT;
  }

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      username: tresdb.stores.account.getName(),
    }));

    var $form = $('#tresdb-search-form');
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
      if (query.hasOwnProperty('creator')) {
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

      if (q.hasOwnProperty('text')) {
        $text.val(q.text.trim());
      }

      if (q.hasOwnProperty('creator')) {
        // TODO Check that creator exists in list. User can typo
        $creator.val(q.creator);
      }

      if (q.hasOwnProperty('order')) {
        $order.val(q.order);
      }

      if (q.hasOwnProperty('skip')) {
        $skip.val(q.skip);
      } else {
        $skip.val(SKIP_DEFAULT);
      }

      if (q.hasOwnProperty('limit')) {
        $limit.val(q.limit);
      } else {
        $limit.val(LIMIT_DEFAULT);
      }

    }(query));

    // Do instant query.
    // Fetch search results.
    // Fetch one more than the limit to see if there is next page.
    // Note that this artificially changes the query.
    query.limit = parseInt(query.limit, 10) + 1;
    markers.getFiltered(query, function responseHandler(err, results) {
      // Hide progress
      if (err) {
        // Display error
        console.error(err);
        if (err.code === BAD_REQUEST) {
          tresdb.ui.show($error400);
        } else {
          tresdb.ui.show($error500);
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
        tresdb.ui.show($prevPage);
      } else {
        tresdb.ui.hide($prevPage);
      }

      if (l > limit) {
        // Not last page
        tresdb.ui.show($nextPage);
      } else {
        tresdb.ui.hide($nextPage);
      }

      // Render results. If there is extra item, remove it.
      // The extra item was used to determine if there is an additional
      // page or not.
      $results.html(listTemplate({
        tagsTemplate: tagsTemplate,
        markers: l > limit ? results.slice(0, -1) : results,
      }));
    });

    // Is query is empty focus to the search input field
    // because user probably did arrive here manually and not by
    // submitting the form.
    // Test this against order because it is always attached.
    if (!query.hasOwnProperty('order')) {
      setTimeout(function () {
        $text.focus();
      }, FOCUS_DELAY);
    }
  };  // end bind


  this.unbind = function () {
    var $form = $('#tresdb-search-form');

    $form.off();
  };

};
