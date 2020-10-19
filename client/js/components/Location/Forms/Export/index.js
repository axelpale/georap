
var account = require('../../../../stores/account');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');

module.exports = function (location) {

  var self = this;
  emitter(self);

  self.bind = function ($mount) {

    // Render
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
      // Prevent both export and viewon being open at the same time.
      ui.hide($('#tresdb-viewon-container'));
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($cont);
    });
  };

  self.unbind = function () {
    $('#tresdb-export-show').off();
    $('#tresdb-export-cancel').off();
  };

};
