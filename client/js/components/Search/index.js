// Component for search form and results.

var markers = require('../../stores/markers');
var tagsTemplate = require('../Location/Tags/tagsList.ejs');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');
var queryString = require('query-string');

var FOCUS_DELAY = 200;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring

  // Init
  var self = this;
  emitter(self);

  var _submitHandler;
  var _responseHandler;

  // Public methods

  this.bind = function ($mount) {

    var myName = tresdb.stores.account.getName();
    $mount.html(template({
      username: myName,
    }));

    var $form = $('#tresdb-search-form');
    var $text = $('#tresdb-search-text');
    var $creator = $('#tresdb-search-creator');
    var $order = $('#tresdb-search-order');
    var $results = $('#tresdb-search-results');
    var $error500 = $('#tresdb-search-500');

    // Load additional users into the form
    tresdb.stores.users.getAll(function (err, users) {
      if (err) {
        // Fail quietly
        return;
      }

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

      var queryObj = {};

      if (text.length > 0) {
        queryObj.text = text;
      }

      if (creator !== 'anyone') {
        queryObj.creator = creator;
      }

      queryObj.order = order;

      tresdb.go('/search?' + queryString.stringify(queryObj));
    };

    _responseHandler = function (err, results) {
      // Hide progress
      if (err) {
        // Display error
        console.error(err);
        tresdb.ui.show($error500);
        return;
      }

      $results.html(listTemplate({
        tagsTemplate: tagsTemplate,
        markers: results,
      }));
    };

    // On form submit, or change of filters,
    // alter URL query parameters and reload the view.
    // The search request is sent after the reload.
    $form.submit(_submitHandler);
    $creator.change(_submitHandler);
    $order.change(_submitHandler);

    var initFormByQuery = function (q) {
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
    };

    // Do instant query.
    // Fetch search results
    markers.getFiltered(query, _responseHandler);
    // While waiting for the response:
    initFormByQuery(query);

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
