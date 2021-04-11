// module EntryFormError
//
var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');

module.exports = function () {
  // Entry form View.
  //
  var self = this;
  emitter(self);

  var $mount = null;
  var $elems = {};

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

  self.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $mount = null;
    }
  };
};
