// Balances table

var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var payments = georap.stores.payments;

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    // Template with loading bar
    $mount.html(template());

    var $progress = $('#georap-balances-progress');
    var $tablecont = $('#georap-balances-container');
    var $error = $('#georap-balances-error');

    payments.getBalances(function (err, users) {
      ui.hide($progress);

      if (err) {
        ui.show($error);
        return;
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
