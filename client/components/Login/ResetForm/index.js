var emitter = require('component-emitter');
var ui = require('georap-ui');
var emailValidator = require('email-validator');
var template = require('./template.ejs');
var account = georap.stores.account;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: georap.i18n.__,
    }));

    $elems.email = $mount.find('#password-reset-email');

    // HACK Prepopulate reset email if such email available and valid
    var $loginEmail = $mount.find('#georap-login-email');
    if ($loginEmail.length > 0) { // if such element
      var loginText = $loginEmail.val();
      if (loginText.length > 0 && emailValidator.validate(loginText)) {
        $elems.email.val($loginEmail.val().trim());
      }
    }

    $elems.cancel = $mount.find('.password-reset-cancel');
    $elems.cancel.click(function () {
      self.emit('cancel');
    });

    $elems.invalid = $mount.find('.password-reset-invalid-email');
    $elems.unknown = $mount.find('.password-reset-unknown-email');
    $elems.error = $mount.find('.password-reset-server-error');
    $elems.success = $mount.find('.password-reset-success');
    $elems.progress = $mount.find('.password-reset-in-progress');

    $elems.form = $mount.find('.password-reset-form');
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      // Get input values
      var resetEmail = $elems.email.val();

      // Hide possible earlier error messages
      ui.hide($elems.invalid);
      ui.hide($elems.unknown);
      ui.hide($elems.error);
      // Hide also possible earlier success message
      ui.hide($elems.success);

      // Validate input
      if (!emailValidator.validate(resetEmail)) {
        // Display error message
        console.log('invalid input:', resetEmail);
        ui.show($elems.invalid);
        return;
      }

      // Okay, input good. Start asking server to send email.

      // Display the progress bar
      ui.show($elems.progress);
      // Hide the form
      ui.hide($elems.form);

      account.sendResetPasswordEmail(resetEmail, function (err) {
        ui.hide($elems.progress);

        if (err) {
          if (err.message === 'Conflict') {
            // Unknown email address
            ui.show($elems.unknown);
            ui.show($elems.form);
          } else {
            // General error message
            ui.show($elems.error);
          }
          return;
        }

        // Password reset email successfully sent
        ui.show($elems.success);
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
