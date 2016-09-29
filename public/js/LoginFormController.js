var validator = require("email-validator");

// Templates
var loginTemplate = require('../templates/login.ejs');

module.exports = function (card, auth) {
  // Parameters:
  //   card
  //     Instance of CardController.
  //     To close login form card on successful login.
  //   auth
  //     Instance of AuthController.

  card.open(loginTemplate(), 'full');

  $('#tresdb-login-form').submit(function (ev) {
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

    auth.login(email, password, function (err) {
      if (err === null) {
        // Successful login
        card.closeAll();
        return;
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
    });
  });


  $('#tresdb-password-reset-button').click(function (ev) {
    ev.preventDefault();
    $('#tresdb-password-reset-form').toggleClass('hidden');

    // Autofill reset email field if email already given.
    var loginEmail = $('#tresdb-login-email').val();
    if (loginEmail !== '') {
      $('#tresdb-password-reset-email').val(loginEmail);
    }
  });

  $('#tresdb-password-reset-form').submit(function (ev) {
    ev.preventDefault();

    // Get input values
    var resetEmail = $('#tresdb-password-reset-email').val();

    // Hide possible earlier error messages
    $('#tresdb-password-reset-invalid-email').addClass('hidden');
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

    auth.sendResetPasswordEmail(resetEmail, function (err) {
      // Hide the progress bar
      $('#tresdb-password-reset-in-progress').addClass('hidden');

      if (err) {
        // Display error message
        $('#tresdb-password-reset-server-error').removeClass('hidden');
        return;
      }  // else

      // Success. Display success message. Keep the form hidden.
      $('#tresdb-password-reset-success').removeClass('hidden');
    });
  });
};
