// Component to list latest posts
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var PostView = require('../../Post');
var rootBus = require('georap-bus');
var postsApi = georap.stores.posts;
var __ = georap.i18n.__;

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

  var appendPosts = function (posts) {
    if ($mount) {
      posts.forEach(function (post) {
        var view = new PostView(post, {
          displayLocation: true,
        });
        var $container = $('<div id="entry-' + post._id + '"></div>');
        $elems.posts.append($container);
        view.bind($container);
        children[post._id] = view;
      });
    }
  };

  var fetchAndAppend = function (callback) {
    if ($mount) {
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);
      postsApi.getLatest({
        skip: skip,
        limit: limit,
      }, function (err, result) {
        // Often not mounted anymore when quickly navigating tabs
        if ($mount) {
          ui.hide($elems.progress);
          if (err) {
            $elems.error.html(err.message);
            ui.show($elems.error);
            return;
          }

          appendPosts(result.entries);

          ui.show($elems.loadMoreBtn);

          if (callback) {
            return callback();
          }
        }
      });
    }
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      __: __,
    }));

    $elems.posts = $mount.find('.latest-posts');
    $elems.progress = $mount.find('.latest-posts-progress');
    $elems.loadMoreBtn = $mount.find('.latest-load-more');
    $elems.error = $mount.find('.latest-posts-error');

    // Click to load more
    $elems.loadMoreBtn.click(function () {
      skip += limit;
      fetchAndAppend();
    });

    // Initial fetch and list render
    fetchAndAppend(function () {
      // Signal that the list is rendered.
      // It seems that setTimeout is required to allow the fetched posts
      // to fill the scrollable container.
      setTimeout(function () {
        self.emit('idle');
      }, 0);
    });
  };

  self.unbind = function () {
    if ($mount) {
      // Stop listening events to posts
      bus.off();
      // Unbind post views
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
