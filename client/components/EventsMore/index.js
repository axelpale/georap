// Component to list locations events in chunks
//
var template = require('./template.ejs');
var emitter = require('component-emitter');
var renderEvent = require('../Events/renderEvent');
var ui = require('georap-ui');
var __ = georap.i18n.__;

var noFilter = function (evs) {
  return evs;
};

module.exports = function (fetch, opts) {
  // Parameters:
  //   fetch
  //     function (skip, limit, callback)
  //       skip
  //         integer
  //       limit
  //         integer
  //       callback
  //         function (err, events)
  //           err
  //           events
  //             array of event objects
  //   opts, optional object with optional props
  //     listSize
  //       integer, default 50, number of events per load
  //     showThumbnails
  //       boolean, default false,
  //     eventFilter
  //       function (evs), a filter to hide certain events
  //
  // Note that fetch fn should not attempt to filter events because
  // it can interfere with more detection. Set opts.eventFilter if
  // any filtering is necessary.
  //

  // Handle parameters
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    listSize: 50,
    showThumbnails: false,
    eventFilter: noFilter,
  }, opts);

  // Init
  var $mount = null;
  var $elems = {};
  var self = this;
  emitter(self);

  // Chunks
  var skip = 0;
  var limit = opts.listSize;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      __: __,
    }));

    $elems.events = $mount.find('.events-group');
    $elems.more = $mount.find('.events-more');
    $elems.progress = $mount.find('.events-progress');
    $elems.error = $mount.find('.events-error');

    var doFetch = function () {
      ui.hide($elems.more);
      ui.show($elems.progress);

      fetch(skip, limit + 1, function (err, events) {
        ui.hide($elems.progress);

        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          return;
        }

        // Remove the extra item and apply given event filter.
        var prettyEvs = opts.eventFilter(events.slice(0, limit));

        prettyEvs.forEach(function (ev) {
          $elems.events.append(renderEvent(ev, opts));
        });

        if (events.length > limit) {
          // More events are available
          ui.show($elems.more);
        }
      });
    };

    $elems.more.click(function (cev) {
      cev.preventDefault();
      skip += opts.listSize;
      doFetch();
    });

    // Initial fetch
    doFetch();
  };

  this.append = function (newEvent) {
    if ($mount) {
      $elems.events.append(renderEvent(newEvent, opts));
    }
  };

  this.prepend = function (newEvent) {
    if ($mount) {
      $elems.events.prepend(renderEvent(newEvent, opts));
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
    }
  };
};
