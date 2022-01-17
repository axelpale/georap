
var account = georap.stores.account;
var config = georap.config;
var loginTemplate = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var emailValidator = require('email-validator');

var UNAUTHORIZED = 401;
var FORBIDDEN = 403;

module.exports = function (onSuccess) {
  // Parameters:
  //   onSuccess
  //     function (), called on successful login

  // Init
  emitter(this);

  // Private methods.

  var loginResponseHandler = function (err) {

    var $form = $('#georap-login-form');
    var $deactivated = $('#georap-login-deactivated');
    var $progress = $('#georap-login-in-progress');
    var $incorrect = $('#georap-login-incorrect');
    var $reset = $('#georap-password-reset');
    var $error = $('#georap-login-server-error');

    // Hide the progress bar
    ui.hide($progress);

    if (!err) {
      // Successful login
      return onSuccess();
    }

    if (err.code === UNAUTHORIZED) {
      // Show error
      ui.show($incorrect);
      // Show forms
      ui.show($form);
      ui.show($reset);

      return;
    } // else

    if (err.code === FORBIDDEN) {
      // Show error for deactivated account. Keep login form hidden.
      var $msg = $deactivated.find('#georap-login-deactivated-message');
      $msg.html(err.message);
      ui.show($deactivated);

      return;
    } // else

    // Show mystery error message. Do not show login form because
    // the issue is probably long-lasting.
    ui.show($error);
  };

  var loginFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get the input values
    var email = $('#georap-login-email').val();
    var password = $('#georap-login-password').val();

    // Clear possible earlier error messages
    ui.hide($('#georap-login-invalid-email'));
    ui.hide($('#georap-login-invalid-password'));
    ui.hide($('#georap-login-incorrect'));
    ui.hide($('#georap-login-server-error'));

    // Validate input
    if (email.length < 1) {
      // Display error message
      ui.show($('#georap-login-invalid-email'));

      return;
    }
    if (password.length < 1) {
      // Display password error message
      ui.show($('#georap-login-invalid-password'));

      return;
    }

    // Okay, everything good. Start login process with the server.

    // Display the progress bar
    ui.show($('#georap-login-in-progress'));
    // Hide the login form
    ui.hide($('#georap-login-form'));
    // Hide the password reset form
    ui.hide($('#georap-password-reset'));

    account.login(email, password, loginResponseHandler);
  };

  var resetButtonHandler = function (ev) {
    // Open the reset form.
    // Autofill reset email field if email already given.
    ev.preventDefault();

    ui.toggleHidden($('#georap-password-reset'));
    ui.show($('#georap-password-reset-form'));

    // Hide possible earlier error messages
    ui.hide($('#georap-password-reset-invalid-email'));
    ui.hide($('#georap-password-reset-unknown-email'));
    ui.hide($('#georap-password-reset-server-error'));
    // Hide also possible earlier success message
    ui.hide($('#georap-password-reset-success'));

    var loginEmail = $('#georap-login-email').val();

    if (loginEmail !== '') {
      $('#georap-password-reset-email').val(loginEmail);
    }
  };

  var resetResponseHandler = function (err) {
    // Hide the progress bar
    ui.hide($('#georap-password-reset-in-progress'));

    if (err) {

      if (err.message === 'Conflict') {
        // Display error message and show the form.
        ui.show($('#georap-password-reset-unknown-email'));
        ui.show($('#georap-password-reset-form'));
      } else {
        // Display general error message
        ui.show($('#georap-password-reset-server-error'));
      }

      return;
    }  // else

    // Success. Display success message. Keep the form hidden.
    ui.show($('#georap-password-reset-success'));
  };

  var resetFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var resetEmail = $('#georap-password-reset-email').val();

    // Hide possible earlier error messages
    ui.hide($('#georap-password-reset-invalid-email'));
    ui.hide($('#georap-password-reset-unknown-email'));
    ui.hide($('#georap-password-reset-server-error'));
    // Hide also possible earlier success message
    ui.hide($('#georap-password-reset-success'));

    // Validate input
    if (!emailValidator.validate(resetEmail)) {
      // Display error message
      ui.show($('#georap-password-reset-invalid-email'));

      return;
    }

    // Okay, input good. Start asking server to send email.

    // Display the progress bar
    ui.show($('#georap-password-reset-in-progress'));
    // Hide the form
    ui.hide($('#georap-password-reset-form'));

    account.sendResetPasswordEmail(resetEmail, resetResponseHandler);
  };

  // Public methods

  this.render = function () {
    return loginTemplate({
      title: config.title,
      // TODO in v12 loginColor is optional, in v13 it becomes required
      // and thus does not need the default value handler anymore.
      loginColor: config.loginColor ? config.loginColor : 'primary',
      // Internationalization
      availableLocales: config.availableLocales,
      __: georap.i18n.__,
    });
  };

  this.bind = function () {
    $('#georap-login-form').submit(loginFormSubmitHandler);
    $('#georap-password-reset-button').click(resetButtonHandler);
    $('.password-reset-cancel').click(resetButtonHandler);
    $('#georap-password-reset-form').submit(resetFormSubmitHandler);
  };

  this.unbind = function () {
    $('#georap-login-form').off();
    $('#georap-password-reset-button').off();
    $('#georap-password-reset-form').off();
  };

};
