// General Error component
//
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {
  var self = this;
  emitter(self);

  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;
  };

  self.update = function (message) {
    if ($mount) {
      // Bootstrap dismissable alert.
      $mount.html(template({
        message: message,
      }));
    }
  };

  self.reset = function () {
    if ($mount) {
      $mount.empty();
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
