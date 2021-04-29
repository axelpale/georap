// Component to list location events
//
var template = require('./list.ejs');
var eventTemplate = require('./event.ejs');
var emitter = require('component-emitter');
var getPoints = require('tresdb-points');
var ui = require('tresdb-ui');
var config = tresdb.config;

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
  var $mount = null;
  var $elems = {};
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    $elems.events = $mount.find('.events-group');

    events.forEach(function (ev) {
      $elems.events.append(eventTemplate({
        ev: ev,
        timestamp: ui.timestamp,
        pointstamp: ui.pointstamp,
        getPoints: getPoints,
        config: config,
        showThumbnail: opts.showThumbnails,
      }));
    });
  };

  this.update = function (updatedEvents) {
    events = updatedEvents;
    if ($mount) {
      $elems.events.empty();

      events.forEach(function (ev) {
        $elems.events.append(eventTemplate({
          ev: ev,
          timestamp: ui.timestamp,
          pointstamp: ui.pointstamp,
          getPoints: getPoints,
          config: config,
          showThumbnail: opts.showThumbnails,
        }));
      });
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
