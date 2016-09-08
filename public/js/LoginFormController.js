
// Templates
var loginTemplate = require('../templates/login.ejs');

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
};
