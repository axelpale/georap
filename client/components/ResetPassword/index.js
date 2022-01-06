// This is the form the user arrives via the link in a password reset email.

var account = georap.stores.account;
var template = require('./template.ejs');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode').default;
var ui = require('georap-ui');

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
    return template({
      email: parsedToken.email,
      __: georap.i18n.__,
    });
  };

  this.bind = function () {

    // Initialize log in button that will be shown after successful reset.
    $('#georap-continue-to-login-button').click(function (ev) {
      ev.preventDefault();
      return showLogin();
    });

    $('#georap-reset-password-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#georap-continue-to-login-button').off();
    $('#georap-reset-password-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    // User has typed in two passwords and submitted the form.
    ev.preventDefault();

    var password = $('#georap-input-new-password').val();
    var passwordAgain = $('#georap-input-again-password').val();

    // Validate
    if (password !== passwordAgain || password === '') {
      // Display error message
      ui.show($('#georap-reset-password-no-match'));

      return;
    }  // else

    // Reveal loading animation.
    ui.show($('#georap-reset-in-progress'));
    // Hide the password form.
    ui.hide($('#georap-reset-password-form'));
    // Hide possible earlier no-match error message
    ui.hide($('#georap-reset-password-no-match'));

    account.resetPassword(token, password, responseHandler);
  };

  responseHandler = function (err) {
    if (!err) {
      // Successful reset
      // Reveal success message
      ui.show($('#georap-reset-password-success'));
      // Reveal "Continue to log in" button
      ui.show($('#georap-reset-password-login'));
      // Hide the loading animation
      ui.hide($('#georap-reset-in-progress'));

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // False token
      // Display token error message.
      ui.show($('#georap-reset-password-token-error'));
      // Reveal "Continue to log in" button
      ui.show($('#georap-reset-password-login'));
      // Hide the loading animation
      ui.hide($('#georap-reset-in-progress'));

      return;
    }  // else

    // Invalid password (too short?)
    // Invalid email (no such account)
    // Server down
    // Database down
    console.error(err);
    // Display error message.
    ui.show($('#georap-reset-password-server-error'));
    // Display the original form
    ui.show($('#georap-reset-password-form'));
    // Hide the loading animation
    ui.hide($('#georap-reset-in-progress'));
  };

};
