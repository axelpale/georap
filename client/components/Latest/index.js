// Component for a list of events.

var emitter = require('component-emitter');
var TabsView = require('./Tabs');
var template = require('./template.ejs');
var EventsView = require('./Events');
var LocationsView = require('./Locations');
var EntriesView = require('./Entries');
var ui = require('georap-ui');
var ScrollRecorder = require('./ScrollRecorder');

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

  // tabHash -> filter
  var tabs = {
    activity: EventsView,
    locations: LocationsView,
    posts: EntriesView,
  };

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    // Render initial page with visible loading bar
    $mount.html(template());

    // Set up tabs
    children.tabs = new TabsView();
    children.tabs.bind($mount.find('.latest-tabs-container'));

    // Tab switch filters the events.
    children.tabs.on('tab_switch', function (hash) {
      self.switchTab(hash);
    });

    // Initial tab
    self.switchTab(children.tabs.getTabHash());
  };

  this.switchTab = function (tabHash) {
    // DEBUG console.log('tab_switch', tabHash);
    if ($mount) {
      // TODO avoid reloading same tab

      // Destroy the previous list view if any.
      if (children.list) {
        children.list.unbind();
        children.list.off('idle');
        // Avoid scroll recording while the view loads
        scrollRecorder.stopRecording();
      }

      // Open new view
      $elems.list = $mount.find('.latest-list-container');
      var ListView = tabs[tabHash];
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
