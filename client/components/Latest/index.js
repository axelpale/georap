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

  // var tabs = {
  //   'activity': 'activity view',
  //   'locations': 'locations view',
  //   'posts': 'posts view',
  // };

  // Public methods

  this.bind = function ($mount) {
    // Render initial page with visible loading bar
    $mount.html(template());

    // Set up tabs
    children.tabs = new TabsView();
    children.tabs.bind($mount.find('.latest-tabs-container'));

    // Set up events
    children.activity = new ActivityView();
    children.activity.bind($mount.find('.latest-activity-container'));

    // Fetch events and then apply previously recorded scroll position.
    // Then, begin recording further scrolls.
    children.activity.on('idle', function () {
      // Set scroll to where we previously left
      scrollRecorder.applyScroll();
      // Record scroll positions
      scrollRecorder.startRecording();
    });
  };

  this.unbind = function () {
    scrollRecorder.stopRecording();
    ui.unbindAll(children);
  };

};
