var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var accountStore = georap.stores.account;
var usersStore = georap.stores.users;

// Phrase input field focus
var FOCUS_DELAY = 200;

var SKIP_DEFAULT = 0;
var LIMIT_DEFAULT = 50;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring

  // Setup
  var self = this;
  emitter(self);
  var $mount = null;
  var $elems = {};

  // Add default values to query if missing
  if (!('skip' in query)) {
    query.skip = SKIP_DEFAULT;
  }
  if (!('limit' in query)) {
    query.limit = LIMIT_DEFAULT;
  }

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var myName = accountStore.getName();

    $mount.html(template({
      username: myName,
    }));

    $elems.form = $mount.find('.search-form');
    $elems.phrase = $mount.find('.search-phrase');
    $elems.creator = $mount.find('.search-creator');
    $elems.order = $mount.find('.search-order');
    $elems.skip = $mount.find('.search-skip');
    $elems.limit = $mount.find('.search-limit');

    // If query is empty focus to the search input field
    // because user probably did arrive here manually and not by
    // submitting the form.
    // Test this against order because it is always attached.
    if (!('order' in query)) {
      setTimeout(function () {
        $elems.phrase.focus();
      }, FOCUS_DELAY);
    }

    // Load additional users into the created-by dropdown
    usersStore.getAll(function (err, users) {
      if (err) {
        // Fail quietly, not so important
        return;
      }

      // Visual separator
      $elems.creator.append('<option disabled>───────</option>');

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
        $elems.creator.append(opt);
      });

      // Reselect correct creator because these were just loaded.
      if ('creator' in query) {
        // Ensure that creator exists in list. User can typo
        var foundUser = null;
        for (var i = 0; i < users.length; i += 1) {
          if (query.creator === users[i].name) {
            foundUser = users[i];
          }
        }
        if (foundUser) {
          $elems.creator.val(query.creator);
        }
      }
    });

    // Init the form.
    (function initFormByQuery(q) {
      // Init the form piece by piece

      if ('text' in q) {
        $elems.phrase.val(q.text.trim());
      }

      if ('creator' in q) {
        // TODO Check that creator exists in list. User can typo
        $elems.creator.val(q.creator);
      }

      if ('order' in q) {
        $elems.order.val(q.order);
      }

      if ('skip' in q) {
        $elems.skip.val(q.skip);
      } else {
        $elems.skip.val(SKIP_DEFAULT);
      }

      if ('limit' in q) {
        $elems.limit.val(q.limit);
      } else {
        $elems.limit.val(LIMIT_DEFAULT);
      }

    }(query));

    var submitHandler = function (ev) {
      // Form submit reloads the view by a new URL.
      if (ev) {
        ev.preventDefault();
      }

      // User easily inputs additional newlines
      // because the user cannot see them.
      var text = $elems.phrase.val().trim();
      var creator = $elems.creator.val();
      var order = $elems.order.val();
      var skip = parseInt($elems.skip.val(), 10);
      var limit = parseInt($elems.limit.val(), 10);

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

      // Inform parent to reload the view
      self.emit('submit', queryObj);
    };

    // On form submit, or change of filters, or page change
    // each alter URL query parameters and reload the view.
    // The search request is sent after the reload.
    $elems.form.submit(submitHandler);
    $elems.creator.change(submitHandler);
    $elems.order.change(submitHandler);
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
    }
  };
};
