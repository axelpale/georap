
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

    auth.login(email, password, function (err) {
      if (err === null) {
        // Successful login
        card.closeAll();
      } else {
        // Invalid
        console.error(err);
      }
    });
  });
};
