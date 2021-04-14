// Component to list location events
//
var template = require('./list.ejs');
var emitter = require('component-emitter');
var getPoints = require('tresdb-points');
var ui = require('tresdb-ui');

module.exports = function (events, opts) {
  // Parameters:
  //   events
  //     list of event objects
  //   opts, optional object with props
  //     showThumbnails
  //       boolean, default false,
  //

  // Handle parameters
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    showThumbnails: false,
  }, opts);

  // Init
  var self = this;
  emitter(self);
  var $mount = null;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      timestamp: ui.timestamp,
      pointstamp: ui.pointstamp,
      getPoints: getPoints,
      events: events,
      showThumbnails: opts.showThumbnails,
    }));
  };

  this.update = function (updatedEvents) {
    events = updatedEvents;
    if ($mount) {
      $mount.html(template({
        timestamp: ui.timestamp,
        pointstamp: ui.pointstamp,
        getPoints: getPoints,
        events: events,
        showThumbnails: opts.showThumbnails,
      }));
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
