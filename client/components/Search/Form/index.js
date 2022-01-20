var template = require('./template.ejs');
var CreatorSelect = require('./CreatorSelect');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var able = georap.stores.account.able;
var __ = georap.i18n.__;

// Phrase input field focus
var FOCUS_DELAY = 200;

var SKIP_DEFAULT = 0;
var LIMIT_DEFAULT = 50;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

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

    $mount.html(template({
      __: __,
    }));

    $elems.form = $mount.find('.search-form');
    $elems.phrase = $mount.find('.search-phrase');
    $elems.creator = $mount.find('.search-creator-group');
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

    // Init the form.
    (function initFormByQuery(q) {
      // Init the form piece by piece

      if ('text' in q) {
        $elems.phrase.val(q.text.trim());
      }

      // NOTE creator inited in child

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
      var order = $elems.order.val();
      var skip = parseInt($elems.skip.val(), 10);
      var limit = parseInt($elems.limit.val(), 10);

      var queryObj = {};

      if (text.length > 0) {
        queryObj.text = text;
      }

      if (children.creator) {
        var creator = children.creator.value();
        if (creator !== 'anyone') {
          queryObj.creator = creator;
        }
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
    $elems.order.change(submitHandler);

    if (able('users')) {
      children.creator = new CreatorSelect(query);
      children.creator.bind($elems.creator);
      // Submit on change
      $elems.creator.change(submitHandler);
    }
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };
};
