// Payment history table

var emitter = require('component-emitter');
var template = require('./template.ejs');
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

    var $open = $('#georap-registration-open');
    var $cancel = $('#georap-registration-cancel');
    var $form = $('#georap-registration-form');
    var $progress = $('#georap-registration-progress');
    var $success = $('#georap-registration-success');
    var $successClose = $('#georap-registration-success button');
    var $error = $('#georap-registration-error');

    $open.click(function (ev) {
      ev.preventDefault();

      if (ui.isHidden($form)) {
        ui.show($form);
        ui.hide($error);
      } else {
        ui.hide($form);
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($form);
    });

    $successClose.click(function (ev) {
      ev.preventDefault();
      ui.hide($success);
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      ui.hide($form);
      ui.show($progress);

      payments.create(function (err) {
        ui.hide($progress);

        if (err) {
          ui.show($error);
          return;
        }

        ui.show($success);
      });
    });
  };

  this.unbind = function () {
    // noop
  };

};
