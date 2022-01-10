var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var validator = require('email-validator');
var account = georap.stores.account;
var siteTitle = georap.config.title;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    var __ = georap.i18n.__;

    $mount.html(template({
      siteTitle: siteTitle,
      email: account.getUser().email,
      __: __,
    }));

    $elems.newEmail = $mount.find('#change-email-email');
    $elems.invalidAddress = $mount.find('.change-email-invalid-address');
    $elems.sendError = $mount.find('.change-email-send-error');
    $elems.sendSuccess = $mount.find('.change-email-send-success');
    $elems.form = $mount.find('.change-email-form');
    $elems.securityCode = $mount.find('#change-email-security-code');
    $elems.password = $mount.find('#change-email-password');
    $elems.submit = $mount.find('.change-email-submit-btn');
    $elems.submitSuccess = $mount.find('.change-email-submit-success');

    $elems.sendBtn = $mount.find('.change-email-send-btn');
    $elems.sendBtn.click(ui.throttle(2000, function () {
      // Clear possible previous errors
      ui.hide($elems.invalidAddress);
      ui.hide($elems.sendError);

      // Read new email
      var newEmail = $elems.newEmail.val();

      // Validate new email locally
      if (!validator.validate(newEmail)) {
        // Invalid email, show error.
        ui.show($elems.invalidAddress);
        return;
      } // else

      // TODO change button label to "Sending..."
      $elems.sendBtn.html(__('sending'));

      // Request to send a security code to the new email
      account.changeEmailSendCode(newEmail, function (err) {
        // Response is { isSuccess, message }
        if (err) {
          // Restore button label
          $elems.sendBtn.html(__('change-email-send'));
          // Display error
          ui.show($elems.sendError);
          console.error(err);
          return;
        }
        // Display success message: security code sent successfully
        ui.show($elems.sendSuccess);
        // Change button label to "Send again"
        $elems.sendBtn.html(__('change-email-send-again'));
        $elems.sendBtn.removeClass('btn-primary');
        $elems.sendBtn.addClass('btn-default');
        // TODO change button style to default
      });
    }));

    // When security code and password fields are filled
    // then enable submit button and change its style to primary
    var handleFormInput = function () {
      var code = $elems.securityCode.val();
      var pwd = $elems.password.val();
      if (code.length === 6 && pwd.length > 2) {
        $elems.submit.removeClass('disabled');
        $elems.submit.removeClass('btn-default');
        $elems.submit.addClass('btn-primary');
      }
    };
    $elems.securityCode.on('input', handleFormInput);
    $elems.password.on('input', handleFormInput);

    // Form submission
    $elems.form.submit(function (ev) {
      // Prevent default form submission behavior.
      ev.preventDefault();

      var code = $elems.securityCode.val();
      var pwd = $elems.password.val();

      if (code.length !== 6 || pwd.length <= 2) {
        // Cancel submission if form is not yet ready.
        return;
      }

      account.changeEmailSave(pwd, code, function (err) {
        if (err) {
          // TODO handle errors
          console.error(err);
          return;
        }

        // TODO hide form
        // Display success message
        ui.show($elems.submitSuccess);
        // TODO display Finish button to close the page
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
