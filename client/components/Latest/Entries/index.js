// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var EntryView = require('../../Entry');
var rootBus = require('tresdb-bus');
var entriesStore = tresdb.stores.entries;

var LIST_SIZE = 10;

module.exports = function () {
  // Init
  var $mount = null;
  var children = {};
  var $elems = {};
  var bus = rootBus.sub();
  var self = this;
  emitter(self);

  var skip = 0;
  var limit = LIST_SIZE;

  var appendEntries = function (entries) {
    if ($mount) {
      entries.forEach(function (entry) {
        var view = new EntryView(entry);
        var $container = $('<div id="entry-' + entry._id + '"></div>');
        $elems.entries.append($container);
        view.bind($container);
        children[entry._id] = view;
      });
    }
  };

  var fetchAndAppend = function () {
    if ($mount) {
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);
      entriesStore.getLatest({
        skip: skip,
        limit: limit,
      }, function (err, result) {
        ui.hide($elems.progress);
        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          return;
        }

        var entries = result.entries;
        // var total = latestResult.entriesCount;

        appendEntries(entries);

        ui.show($elems.loadMoreBtn);
      });
    }
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    $elems.entries = $mount.find('.latest-entries');
    $elems.progress = $mount.find('.latest-entries-progress');
    $elems.loadMoreBtn = $mount.find('.latest-load-more');
    $elems.error = $mount.find('.latest-entries-error');

    ui.show($elems.loadMoreBtn);
    // Click to load more
    $elems.loadMoreBtn.click(function () {
      skip += limit;
      fetchAndAppend();
    });

    // Initial event fetch and list render
    fetchAndAppend();

    // Signal that the list is rendered.
    // It seems that setTimeout is required to allow the fetched events
    // to fill the scrollable container.
    setTimeout(function () {
      self.emit('idle');
    }, 0);
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      // Stop listening events
      bus.off();
      // Unbind events view
      ui.unbindAll(children);
      ui.offAll($elems);
      children = {};
    }
  };
};
