
var account = tresdb.stores.account;
var config = tresdb.config;
var loginTemplate = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var validator = require('email-validator');

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

    var $form = $('#tresdb-login-form');
    var $deactivated = $('#tresdb-login-deactivated');
    var $progress = $('#tresdb-login-in-progress');
    var $incorrect = $('#tresdb-login-incorrect');
    var $reset = $('#tresdb-password-reset');
    var $error = $('#tresdb-login-server-error');

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
      var $msg = $deactivated.find('#tresdb-login-deactivated-message');
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
    var email = $('#tresdb-login-email').val();
    var password = $('#tresdb-login-password').val();

    // Clear possible earlier error messages
    ui.hide($('#tresdb-login-invalid-email'));
    ui.hide($('#tresdb-login-invalid-password'));
    ui.hide($('#tresdb-login-incorrect'));
    ui.hide($('#tresdb-login-server-error'));

    // Validate input
    if (email.length < 1) {
      // Display error message
      ui.show($('#tresdb-login-invalid-email'));

      return;
    }
    if (password.length < 1) {
      // Display password error message
      ui.show($('#tresdb-login-invalid-password'));

      return;
    }

    // Okay, everything good. Start login process with the server.

    // Display the progress bar
    ui.show($('#tresdb-login-in-progress'));
    // Hide the login form
    ui.hide($('#tresdb-login-form'));
    // Hide the password reset form
    ui.hide($('#tresdb-password-reset'));

    account.login(email, password, loginResponseHandler);
  };

  var resetButtonHandler = function (ev) {
    // Open the reset form.
    // Autofill reset email field if email already given.
    ev.preventDefault();

    ui.toggleHidden($('#tresdb-password-reset-form'));

    var loginEmail = $('#tresdb-login-email').val();

    if (loginEmail !== '') {
      $('#tresdb-password-reset-email').val(loginEmail);
    }
  };

  var resetResponseHandler = function (err) {
    // Hide the progress bar
    ui.hide($('#tresdb-password-reset-in-progress'));

    if (err) {

      if (err.message === 'Conflict') {
        // Display error message and show the form.
        ui.show($('#tresdb-password-reset-unknown-email'));
        ui.show($('#tresdb-password-reset-form'));
      } else {
        // Display general error message
        ui.show($('#tresdb-password-reset-server-error'));
      }

      return;
    }  // else

    // Success. Display success message. Keep the form hidden.
    ui.show($('#tresdb-password-reset-success'));
  };

  var resetFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var resetEmail = $('#tresdb-password-reset-email').val();

    // Hide possible earlier error messages
    ui.hide($('#tresdb-password-reset-invalid-email'));
    ui.hide($('#tresdb-password-reset-unknown-email'));
    ui.hide($('#tresdb-password-reset-server-error'));
    // Hide also possible earlier success message
    ui.hide($('#tresdb-password-reset-success'));

    // Validate input
    if (!validator.validate(resetEmail)) {
      // Display error message
      ui.show($('#tresdb-password-reset-invalid-email'));

      return;
    }

    // Okay, input good. Start asking server to send email.

    // Display the progress bar
    ui.show($('#tresdb-password-reset-in-progress'));
    // Hide the form
    ui.hide($('#tresdb-password-reset-form'));

    account.sendResetPasswordEmail(resetEmail, resetResponseHandler);
  };

  // Public methods

  this.render = function () {
    return loginTemplate({
      title: config.title,
      // TODO in v12 loginColor is optional, in v13 it becomes required
      // and thus does not need the default value handler anymore.
      loginColor: config.loginColor ? config.loginColor : 'primary',
    });
  };

  this.bind = function () {
    $('#tresdb-login-form').submit(loginFormSubmitHandler);
    $('#tresdb-password-reset-button').click(resetButtonHandler);
    $('#tresdb-password-reset-form').submit(resetFormSubmitHandler);
  };

  this.unbind = function () {
    $('#tresdb-login-form').off();
    $('#tresdb-password-reset-button').off();
    $('#tresdb-password-reset-form').off();
  };

};
