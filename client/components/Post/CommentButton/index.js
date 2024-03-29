var ui = require('georap-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var __ = georap.i18n.__;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: __,
    }));

    $elems.open = $mount.find('.comment-form-open');
    var waitMs = 500;
    $elems.open.click(ui.throttle(waitMs, function () {
      self.emit('open');
    }));
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
