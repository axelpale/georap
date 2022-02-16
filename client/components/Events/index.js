// Component to list location events
//
var template = require('./list.ejs');
var emitter = require('component-emitter');
var renderEvent = require('./renderEvent');

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
      $elems.events.append(renderEvent(ev, opts));
    });
  };

  this.update = function (updatedEvents) {
    events = updatedEvents;
    if ($mount) {
      $elems.events.empty();

      events.forEach(function (ev) {
        $elems.events.append(renderEvent(ev, opts));
      });
    }
  };

  this.append = function (newEvent) {
    if ($mount) {
      $elems.events.append(renderEvent(newEvent, opts));
    }
  };

  this.prepend = function (newEvent) {
    if ($mount) {
      $elems.events.prepend(renderEvent(newEvent, opts));
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
