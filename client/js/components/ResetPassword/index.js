// This is the form the user arrives via the link in a password reset email.

var account = tresdb.stores.account;
var template = require('./template.ejs');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');
var ui = require('tresdb-ui');

module.exports = function (token, showLogin) {
  // Parameters
  //   token
  //     string
  //   showLogin
  //     function ()

  // Init
  emitter(this);

  var parsedToken = jwtDecode(token);
  // Note: server will check if token still fresh. No need to check it here
  // and duplicate the information about duration.


  // Private method declaration

  var submitHandler;
  var responseHandler;


  // Public methods

  this.render = function () {
    return template({ email: parsedToken.email });
  };

  this.bind = function () {

    // Initialize log in button that will be shown after successful reset.
    $('#tresdb-continue-to-login-button').click(function (ev) {
      ev.preventDefault();
      return showLogin();
    });

    $('#tresdb-reset-password-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#tresdb-continue-to-login-button').off();
    $('#tresdb-reset-password-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    // User has typed in two passwords and submitted the form.
    ev.preventDefault();

    var password = $('#tresdb-input-new-password').val();
    var passwordAgain = $('#tresdb-input-again-password').val();

    // Validate
    if (password !== passwordAgain || password === '') {
      // Display error message
      ui.show($('#tresdb-reset-password-no-match'));

      return;
    }  // else

    // Reveal loading animation.
    ui.show($('#tresdb-reset-in-progress'));
    // Hide the password form.
    ui.hide($('#tresdb-reset-password-form'));
    // Hide possible earlier no-match error message
    ui.hide($('#tresdb-reset-password-no-match'));

    account.resetPassword(token, password, responseHandler);
  };

  responseHandler = function (err) {
    if (!err) {
      // Successful reset
      // Reveal success message
      ui.show($('#tresdb-reset-password-success'));
      // Reveal "Continue to log in" button
      ui.show($('#tresdb-reset-password-login'));
      // Hide the loading animation
      ui.hide($('#tresdb-reset-in-progress'));

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // False token
      // Display token error message.
      ui.show($('#tresdb-reset-password-token-error'));
      // Reveal "Continue to log in" button
      ui.show($('#tresdb-reset-password-login'));
      // Hide the loading animation
      ui.hide($('#tresdb-reset-in-progress'));

      return;
    }  // else

    // Invalid password (too short?)
    // Invalid email (no such account)
    // Server down
    // Database down
    console.error(err);
    // Display error message.
    ui.show($('#tresdb-reset-password-server-error'));
    // Display the original form
    ui.show($('#tresdb-reset-password-form'));
    // Hide the loading animation
    ui.hide($('#tresdb-reset-in-progress'));
  };

};
