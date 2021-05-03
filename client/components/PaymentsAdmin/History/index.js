// Payment history table

var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var payments = tresdb.stores.payments;

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    // Template with loading bar
    $mount.html(template());

    var $progress = $('#tresdb-history-progress');
    var $tablecont = $('#tresdb-history-container');
    var $error = $('#tresdb-history-error');

    payments.getAll(function (err, ps) {
      ui.hide($progress);

      if (err) {
        ui.show($error);
        return;
      }

      $tablecont.html(tableTemplate({
        payments: ps,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
