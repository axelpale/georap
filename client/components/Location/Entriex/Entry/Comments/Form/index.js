// Form for comment creation and edit
var ui = require('tresdb-ui');
var template = require('./template.ejs');

var MIN_LEN = tresdb.config.comments.minMessageLength;
var MAX_LEN = tresdb.config.comments.maxMessageLength;

module.exports = function () {

  // Setup
  var self = this;
  var $mount = null;
  var children = {};
  var $elems = {};

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      MIN_LEN: MIN_LEN,
      MAX_LEN: MAX_LEN,
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
