var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');

module.exports = function (attachment) {

  emitter(this);

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      attachment: attachment,
    }));
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
