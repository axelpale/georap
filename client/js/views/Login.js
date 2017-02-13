var emitter = require('component-emitter');
var validator = require('email-validator');
var account = require('../stores/account');

// Templates
var loginTemplate = require('./Login.ejs');

module.exports = function (onSuccess) {
  // Parameters:
  //   onSuccess
  //     function (), called on successful login

  // Init
  emitter(this);

  // Private methods.

  var loginResponseHandler = function (err) {
    if (err === null) {
      // Successful login
      return onSuccess();
    }  // else

    // Hide the progress bar
    $('#tresdb-login-in-progress').addClass('hidden');

    if (err.name === 'UnknownEmailError') {
      // Show error
      $('#tresdb-login-unknown-email').removeClass('hidden');
      // Show forms
      $('#tresdb-login-form').removeClass('hidden');
      $('#tresdb-password-reset').removeClass('hidden');

      return;
    }  // else

    if (err.name === 'IncorrectPasswordError') {
      // Show error
      $('#tresdb-login-incorrect-password').removeClass('hidden');
      // Show forms
      $('#tresdb-login-form').removeClass('hidden');
      $('#tresdb-password-reset').removeClass('hidden');

      return;
    }  // else

    // Show mystery error message. Do not show login form because
    // the issue is probably long-lasting.
    $('#tresdb-login-server-error').removeClass('hidden');
  };

  var loginFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get the input values
    var email = $('#tresdb-login-email').val();
    var password = $('#tresdb-login-password').val();

    // Clear possible earlier error messages
    $('#tresdb-login-invalid-email').addClass('hidden');
    $('#tresdb-login-invalid-password').addClass('hidden');
    $('#tresdb-login-unknown-email').addClass('hidden');
    $('#tresdb-login-incorrect-password').addClass('hidden');
    $('#tresdb-login-server-error').addClass('hidden');

    // Validate input
    if (!validator.validate(email)) {
      // Display error message
      $('#tresdb-login-invalid-email').removeClass('hidden');

      return;
    }
    if (password.length < 1) {
      // Display password error message
      $('#tresdb-login-invalid-password').removeClass('hidden');

      return;
    }

    // Okay, everything good. Start login process with the server.

    // Display the progress bar
    $('#tresdb-login-in-progress').removeClass('hidden');
    // Hide the login form
    $('#tresdb-login-form').addClass('hidden');
    // Hide the password reset form
    $('#tresdb-password-reset').addClass('hidden');

    account.login(email, password, loginResponseHandler);
  };

  var resetButtonHandler = function (ev) {
    // Open the reset form.
    // Autofill reset email field if email already given.
    ev.preventDefault();

    $('#tresdb-password-reset-form').toggleClass('hidden');

    var loginEmail = $('#tresdb-login-email').val();

    if (loginEmail !== '') {
      $('#tresdb-password-reset-email').val(loginEmail);
    }
  };

  var resetResponseHandler = function (err) {
    // Hide the progress bar
    $('#tresdb-password-reset-in-progress').addClass('hidden');

    if (err) {

      if (err.name === 'UnknownEmailError') {
        // Display error message and show the form.
        $('#tresdb-password-reset-unknown-email').removeClass('hidden');
        $('#tresdb-password-reset-form').removeClass('hidden');
      } else {
        // Display general error message
        $('#tresdb-password-reset-server-error').removeClass('hidden');
      }

      return;
    }  // else

    // Success. Display success message. Keep the form hidden.
    $('#tresdb-password-reset-success').removeClass('hidden');
  };

  var resetFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var resetEmail = $('#tresdb-password-reset-email').val();

    // Hide possible earlier error messages
    $('#tresdb-password-reset-invalid-email').addClass('hidden');
    $('#tresdb-password-reset-unknown-email').addClass('hidden');
    $('#tresdb-password-reset-server-error').addClass('hidden');
    // Hide also possible earlier success message
    $('#tresdb-password-reset-success').addClass('hidden');

    // Validate input
    if (!validator.validate(resetEmail)) {
      // Display error message
      $('#tresdb-password-reset-invalid-email').removeClass('hidden');

      return;
    }

    // Okay, input good. Start asking server to send email.

    // Display the progress bar
    $('#tresdb-password-reset-in-progress').removeClass('hidden');
    // Hide the form
    $('#tresdb-password-reset-form').addClass('hidden');

    account.sendResetPasswordEmail(resetEmail, resetResponseHandler);
  };

  // Public methods

  this.render = function () {
    return loginTemplate();
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
