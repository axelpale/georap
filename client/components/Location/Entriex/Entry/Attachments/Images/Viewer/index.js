var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');

module.exports = function (attachment) {

  emitter(this);

  var $mount = null;
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      attachment: attachment,
    }));
  };

  this.update = function (att) {
    if ($mount) {
      $mount.html(template({
        attachment: att,
      }));
    }
  };

  this.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $mount = null;
    }
  };
};
