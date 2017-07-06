
var ui = require('../../../lib/ui');
var account = require('../../../../stores/account');
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function (location) {

  var self = this;
  emitter(self);

  self.bind = function ($mount) {

    $mount.html(template({
      id: location.getId(),
      token: account.getToken(),
    }));

    var $cont = $('#tresdb-export-container');
    var $show = $('#tresdb-export-show');
    var $cancel = $('#tresdb-export-cancel');

    $show.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($cont);
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($cont);
    });
  };

  self.unbind = function () {
    var $show = $('#tresdb-export-show');
    var $cancel = $('#tresdb-export-cancel');

    $show.off();
    $cancel.off();
  };

};
