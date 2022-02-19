var template = require('./template.ejs');
var ui = require('georap-ui');
var locale = georap.i18n.locale;
var __ = georap.i18n.__;

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     entry object
  //   comment
  //     comment object
  //

  // Setup
  var self = this;
  var $elems = {};
  var children = {};
  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      author: comment.user,
      timestamp: ui.timestamp(comment.time, locale),
      __: __,
    }));
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
    }
  };
};
