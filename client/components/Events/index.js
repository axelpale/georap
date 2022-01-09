// Component to list location events
//
var template = require('./list.ejs');
var eventTemplate = require('./event.ejs');
var emitter = require('component-emitter');
var getPoints = require('georap-points');
var ui = require('georap-ui');
var flagstamp = require('../Entry/flagstamp');
var config = georap.config;
var locale = georap.i18n.locale;
var __ = georap.i18n.__;

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

  var renderEvent = function (ev) {
    return eventTemplate({
      ev: ev,
      timestamp: ui.timestamp(ev.time, locale),
      pointstamp: ui.pointstamp,
      flagstamp: flagstamp,
      getPoints: getPoints,
      config: config,
      showThumbnail: opts.showThumbnails,
      __: __,
    });
  };

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    $elems.events = $mount.find('.events-group');

    events.forEach(function (ev) {
      $elems.events.append(renderEvent(ev));
    });
  };

  this.update = function (updatedEvents) {
    events = updatedEvents;
    if ($mount) {
      $elems.events.empty();

      events.forEach(function (ev) {
        $elems.events.append(renderEvent(ev));
      });
    }
  };

  this.prepend = function (newEvent) {
    if ($mount) {
      $elems.events.prepend(renderEvent(newEvent));
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
