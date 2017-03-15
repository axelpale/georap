// Balances table

var payments = require('../../../stores/payments');
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');

var show = function ($el) {
  $el.removeClass('hidden');
};

var hide = function ($el) {
  $el.addClass('hidden');
};

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    // Template with loading bar
    $mount.html(template());

    var $progress = $('#tresdb-balances-progress');
    var $tablecont = $('#tresdb-balances-container');
    var $error = $('#tresdb-balances-error');

    payments.getBalances(function (err, users) {
      hide($progress);

      if (err) {
        return show($error);
      }

      $tablecont.html(tableTemplate({
        users: users,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
