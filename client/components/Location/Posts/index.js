// Component to list posts.
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var PostView = require('../../Post');
var rootBus = require('georap-bus');
var locationsApi = georap.stores.locations;

var PAGE_SIZE = georap.config.entries.pageSize;

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

  var appendPosts = function (posts, prepend) {
    // Parameters
    //   posts
    //     array
    //   prepend
    //     Set true to add to beginning, false to add to bottom.
    //     Default false.
    //
    if ($mount) {
      posts.forEach(function (post) {
        var view = new PostView(post);
        var $container = $('<div id="entry-' + post._id + '"></div>');
        if (prepend) {
          $elems.posts.prepend($container);
        } else {
          $elems.posts.append($container);
        }
        view.bind($container);
        children[post._id] = view;
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

        appendPosts(result.entries);

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

    $elems.posts = $mount.find('.location-posts-list');
    $elems.progress = $mount.find('.location-posts-progress');
    $elems.loadMoreBtn = $mount.find('.load-more');
    $elems.error = $mount.find('.location-posts-error');

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
        appendPosts([ev.data.entry], true);
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
