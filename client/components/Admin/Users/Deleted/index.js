var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');

module.exports = function (users) {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      users: users.filter(function (u) {
        return u.deleted;
      }),
      __: georap.i18n.__,
    }));
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
