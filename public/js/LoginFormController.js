
// Templates
var loginTemplate = require('../templates/login.ejs');
var alertTemplate = require('../templates/alert.ejs');

module.exports = function (card, auth) {
  // Parameters:
  //   card
  //     Instance of CardController.
  //     To close login form card on successful login.
  //   auth
  //     Instance of AuthController.

  card.open(loginTemplate());

  $('#tresdb-login-form').submit(function (ev) {
    ev.preventDefault();

    console.log('Login form submitted');

    var email = $('#tresdb-login-email').val();
    var password = $('#tresdb-login-password').val();

    // Field for error messages
    var errors = $('#tresdb-login-errors');

    auth.login(email, password, function (err) {
      if (err === null) {
        // Successful login
        card.closeAll();
      } else {
        // Invalid
        if (err.name === 'login-invalid-email') {
          errors.text('Unknown email address. Please, ensure the address is correct.');
        } else if (err.name === 'login-invalid-password') {
          errors.text('Incorrect password. Please, try again.');
        } else {
          errors.text('Unknown error: ' + err.name);
        }
      }
    });
  });

  $resetForm = $('#tresdb-password-reset-form');
  $resetFormInfo = $('#tresdb-password-reset-info');

  $('#tresdb-password-reset').click(function (ev) {
    ev.preventDefault();
    $resetForm.toggleClass('hidden');

    // Autofill reset email field if email already given.
    var loginEmail = $('#tresdb-login-email').val();
    if (loginEmail !== '') {
      $('#tresdb-password-reset-email').val(loginEmail);
    }
  });

  $resetForm.submit(function (ev) {
    ev.preventDefault();

    var resetEmail = $('#tresdb-password-reset-email').val();

    auth.resetPassword(resetEmail, function (err) {
      if (err) {
        // Display error message. Possible cause: invalid email
        $resetFormInfo.html(alertTemplate({
          msg: 'Please ensure your email address is correct.',
          context: 'danger'
        }));
        return;
      }  // else
      // Success. Hide form.
      $resetForm.addClass('hidden');
      // Display success message.
      $resetFormInfo.html(alertTemplate({
        msg: 'Password reset message sent successfully. '
          + 'Please check your email.',
        context: 'success'
      }));
    });
  });
};
