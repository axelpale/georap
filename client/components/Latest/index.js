// Component for a list of events.

var emitter = require('component-emitter');
var TabsView = require('georap-components').Tabs;
var template = require('./template.ejs');
var EventsView = require('./Events');
var LocationsView = require('./Locations');
var PostsView = require('./Posts');
var ui = require('georap-ui');
var ScrollRecorder = require('./ScrollRecorder');
var __ = georap.i18n.__;

// Record scroll position to help browsing through the list
// and avoid scrolling in other views to affect the events list.
// The state and the methods need to be placed outside of the view class
// because the class is recreated every time.
var scrollRecorder = new ScrollRecorder();

module.exports = function () {
  // Parameters:
  //   events
  //     models.Events

  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};

  // tabKey -> component
  var tabViews = {
    events: EventsView,
    locations: LocationsView,
    posts: PostsView,
  };

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    // Render initial page with visible loading bar
    $mount.html(template({
      __: __,
    }));

    // Set up tabs
    children.tabs = new TabsView({
      tabs: [
        {
          key: 'events',
          title: __('activity'),
          className: 'latest-events',
        },
        {
          key: 'locations',
          title: __('locations'),
          className: 'latest-locations',
        },
        {
          key: 'posts',
          title: __('posts'),
          className: 'latest-posts',
        },
      ],
      defaultTab: 'events',
      storageKey: 'georap-latest-tab',
    });
    children.tabs.bind($mount.find('.latest-tabs-container'));

    // Tab switch filters the events.
    children.tabs.on('tab_switch', function (key) {
      self.switchTab(key);
    });

    // Initial tab
    self.switchTab(children.tabs.getTabKey());
  };

  this.switchTab = function (tabKey) {
    // DEBUG console.log('tab_switch', tabHash);
    if ($mount) {
      // Destroy the previous list view if any.
      if (children.list) {
        children.list.unbind();
        children.list.off('idle');
        // Avoid scroll recording while the view loads
        scrollRecorder.stopRecording();
      }

      // Open new view
      $elems.list = $mount.find('.latest-list-container');
      var ListView = tabViews[tabKey];
      children.list = new ListView();
      children.list.bind($elems.list);

      // Fetch events and then apply previously recorded scroll position.
      // Then, begin recording further scrolls.
      children.list.on('idle', function () {
        // Set scroll to where we previously left
        scrollRecorder.applyScroll();
        // Record scroll positions
        scrollRecorder.startRecording();
      });
    }
  };

  this.unbind = function () {
    if ($mount) {
      scrollRecorder.stopRecording();
      ui.unbindAll(children);
      ui.offAll(children);
      children = {};
      ui.offAll($elems);
      $mount = null;
    }
  };

};
