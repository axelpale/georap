/* eslint-disable max-statements */
var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var validator = require('email-validator');
var account = georap.stores.account;
var siteTitle = georap.config.title;
// HTTP status codes
var UNAUTHORIZED = 401;
var CONFLICT = 409;

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

    $elems.finishRow = $mount.find('.change-email-finish');
    $elems.formsRow = $mount.find('.change-email-forms');
    $elems.invalidAddress = $mount.find('.change-email-invalid-address');
    $elems.newEmail = $mount.find('#change-email-email');
    $elems.password = $mount.find('#change-email-password');
    $elems.saveBtn = $mount.find('.change-email-save-btn');
    $elems.saveError = $mount.find('.change-email-save-error');
    $elems.saveForm = $mount.find('.change-email-save-form');
    $elems.saveProgress = $mount.find('.change-email-save-progress');
    $elems.saveUnauth = $mount.find('.change-email-save-unauth');
    $elems.securityCode = $mount.find('#change-email-security-code');
    $elems.sendBtn = $mount.find('.change-email-send-btn');
    $elems.sendConflict = $mount.find('.change-email-send-conflict');
    $elems.sendError = $mount.find('.change-email-send-error');
    $elems.sendForm = $mount.find('.change-email-send-form');
    $elems.sendSuccess = $mount.find('.change-email-send-success');
    $elems.successOldEmail = $mount.find('.change-email-old');
    $elems.successNewEmail = $mount.find('.change-email-new');

    $elems.sendForm.submit(ui.throttle(2000, function (ev) {
      // Prevent default submit behavior (page reload)
      ev.preventDefault();

      // Clear possible previous errors
      ui.hide($elems.invalidAddress);
      ui.hide($elems.sendConflict);
      ui.hide($elems.sendError);

      // Read new email
      var newEmail = $elems.newEmail.val();

      // Validate new email locally
      if (!validator.validate(newEmail)) {
        // Invalid email, show error.
        ui.show($elems.invalidAddress);
        return;
      } // else

      // Change button label to "Sending..."
      $elems.sendBtn.html(__('sending'));

      // Request to send a security code to the new email
      account.changeEmailSendCode(newEmail, function (err) {
        // Response is { isSuccess, message }
        if (err) {
          // Restore button label
          $elems.sendBtn.html(__('change-email-send'));
          // Determine error
          if (err.code === CONFLICT) {
            // Email already exists conflict
            ui.show($elems.sendConflict);
          } else {
            // Unknown error
            console.error(err);
            ui.show($elems.sendError);
          }
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
        $elems.saveBtn.removeClass('disabled');
        $elems.saveBtn.removeClass('btn-default');
        $elems.saveBtn.addClass('btn-primary');
      } else {
        $elems.saveBtn.removeClass('btn-primary');
        $elems.saveBtn.addClass('disabled');
        $elems.saveBtn.addClass('btn-default');
      }
    };
    $elems.securityCode.on('input', handleFormInput);
    $elems.password.on('input', handleFormInput);

    // Form submission
    $elems.saveForm.submit(ui.throttle(2000, function (ev) {
      // Prevent default form submission behavior.
      ev.preventDefault();

      var code = $elems.securityCode.val();
      var pwd = $elems.password.val();

      if (code.length !== 6 || pwd.length <= 2) {
        // Cancel submission if form is not yet ready.
        return;
      }

      // Show loading bar and hide button
      ui.hide($elems.saveBtn);
      ui.show($elems.saveProgress);

      account.changeEmailSave(pwd, code, function (err, response) {
        // Hide progress bar
        ui.hide($elems.saveProgress);
        if (err) {
          // Display button again
          ui.show($elems.saveBtn);
          if (err.code === UNAUTHORIZED) {
            ui.show($elems.saveUnauth);
            return;
          }
          ui.show($elems.saveError);
          console.error(err);
          return;
        }

        // Hide form & display success
        ui.hide($elems.formsRow);
        ui.show($elems.finishRow);
        // Render emails
        $elems.successOldEmail.text(response.oldEmail);
        $elems.successNewEmail.text(response.newEmail);
      });
    }));
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
