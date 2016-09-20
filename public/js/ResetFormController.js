var jwtDecode = require('jwt-decode');
var LoginFormController = require('./LoginFormController');

// Templates
var resetFormTemplate = require('../templates/resetForm.ejs');

module.exports = function (card, auth, token) {

  var parsedToken = jwtDecode(token);
  // TODO check if token still fresh
  card.open(resetFormTemplate({ email: parsedToken.email }), 'full');

  $('#tresdb-reset-password-form').submit(function (ev) {
    ev.preventDefault();

    var password = $('#tresdb-input-new-password').val();
    var passwordAgain = $('#tresdb-input-again-password').val();

    auth.resetPassword(token, password, function (err) {
      if (err === null) {
        // Successful reset
        console.log('Successful reset');
        // TODO Stop animation and enable continue to log in button.
        // for now, just open login form
        new LoginFormController(card, auth);
      } else {
        // Invalid password (too short?)
        // Invalid email (no such account)
        // False token
        // Server down
        // Database down
        console.error(err);
      }
    });
  });
};
