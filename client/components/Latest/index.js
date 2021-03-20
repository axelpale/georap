// Component for a list of events.

var emitter = require('component-emitter');
var TabsView = require('./Tabs');
var template = require('./template.ejs');
var ActivityView = require('./Activity');
var ui = require('tresdb-ui');
var createScrollRecorder = require('./createScrollRecorder');

// Record scroll position to help browsing through the list
// and avoid scrolling in other views to affect the events list.
// The state and the methods need to be placed outside of the view class
// because the class is recreated every time.
var scrollRecorder = createScrollRecorder();

module.exports = function () {
  // Parameters:
  //   events
  //     models.Events

  // Init
  var self = this;
  emitter(self);
  var children = {};
  var $elems = {};

  // tabHash -> filter
  var tabs = {
    activity: function () {
      return true;
    },
    locations: function (ev) {
      return ev.type === 'location_created';
    },
    posts: function (ev) {
      return [
        'location_entry_created',
        'location_entry_comment_created',
      ].indexOf(ev.type) > -1;
    },
  };
  var defaultTabHash = 'activity';

  // Public methods

  this.bind = function ($mount) {
    // Render initial page with visible loading bar
    $mount.html(template());

    // Set up tabs
    children.tabs = new TabsView();
    children.tabs.bind($mount.find('.latest-tabs-container'));
    var tabHash = children.tabs.getTabHash();
    if (!(tabHash in tabs)) {
      console.warn('No tab found:', tabHash);
      tabHash = defaultTabHash;
    }

    // Set up events
    children.activity = new ActivityView();
    $elems.activity = $mount.find('.latest-activity-container');
    children.activity.bind($elems.activity, tabs[tabHash]);

    // Fetch events and then apply previously recorded scroll position.
    // Then, begin recording further scrolls.
    children.activity.on('idle', function () {
      // Set scroll to where we previously left
      scrollRecorder.applyScroll();
      // Record scroll positions
      scrollRecorder.startRecording();
    });

    // Tab switch filters the events.
    children.tabs.on('tab_switch', function (hash) {
      // DEBUG console.log('tab_switch', hash);
      children.activity.update(tabs[hash]);
    });
  };

  this.unbind = function () {
    scrollRecorder.stopRecording();
    ui.unbindAll(children);
    ui.offAll(children);
    children = {};
    ui.offAll($elems);
  };

};
