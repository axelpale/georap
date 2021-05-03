// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var EntryView = require('../../Entry');
var rootBus = require('georap-bus');
var locationsApi = tresdb.stores.locations;

var PAGE_SIZE = tresdb.config.entries.pageSize;

module.exports = function (locationId) {
  // Init
  var $mount = null;
  var children = {};
  var $elems = {};
  var bus = rootBus.sub();
  var self = this;
  emitter(self);

  var skip = 0;
  var limit = PAGE_SIZE;

  var appendEntries = function (entries, prepend) {
    // Parameters
    //   entries
    //     array
    //   prepend
    //     Set true to add to beginning, false to add to bottom.
    //     Default false.
    //
    if ($mount) {
      entries.forEach(function (entry) {
        var view = new EntryView(entry);
        var $container = $('<div id="entry-' + entry._id + '"></div>');
        if (prepend) {
          $elems.entries.prepend($container);
        } else {
          $elems.entries.append($container);
        }
        view.bind($container);
        children[entry._id] = view;
      });
    }
  };

  var fetchAndAppend = function (callback) {
    if ($mount) {
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);
      locationsApi.getEntries({
        locationId: locationId,
        skip: skip,
        limit: limit,
      }, function (err, result) {
        ui.hide($elems.progress);
        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          // NOTE loadMoreBtn might stay hidden. User needs to refresh.
          return;
        }

        var entries = result.entries;
        appendEntries(entries);

        if (result.more) {
          ui.show($elems.loadMoreBtn);
        }

        if (callback) {
          return callback();
        }
      });
    }
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    $elems.entries = $mount.find('.location-entries');
    $elems.progress = $mount.find('.location-entries-progress');
    $elems.loadMoreBtn = $mount.find('.load-more');
    $elems.error = $mount.find('.location-entries-error');

    // Click to load more
    $elems.loadMoreBtn.click(function () {
      skip += limit;
      fetchAndAppend();
    });

    // Initial event fetch and list render
    fetchAndAppend(function () {
      // Signal that the list is rendered.
      // It seems that setTimeout is required to allow the fetched events
      // to fill the scrollable container.
      setTimeout(function () {
        self.emit('idle');
      }, 0);
    });

    bus.on('location_entry_created', function (ev) {
      var id = ev.data.entryId;
      if (!(id in children)) {
        appendEntries([ev.data.entry], true);
      }
    });

    bus.on('location_entry_changed', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].update(ev);
      }
    });

    bus.on('location_entry_removed', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].unbind();
        delete children[id];
        $('#entry-' + id).remove();
      }
    });

    bus.on('location_entry_moved_out', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].unbind();
        delete children[id];
        $('#entry-' + id).remove();
      }
    });
  };

  self.unbind = function () {
    if ($mount) {
      // Stop listening events
      bus.off();
      // Unbind events view
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      // Clear
      $mount.empty();
      $mount = null;
    }
  };
};
