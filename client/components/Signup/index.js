// A form for an invited user to sign up.

var accountStore = georap.stores.account;
var template = require('./template.ejs');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode').default;
var ui = require('georap-ui');
var siteTitle = georap.config.title;

module.exports = function (token, goLogin) {
  // Parameters:
  //   token
  //     The invitation token the user received by email.
  //   goLogin
  //     function (): will ask router to go to login

  // Init
  emitter(this);

  var parsedToken = jwtDecode(token);


  // Private methods declaration

  var submitHandler;
  var responseHandler;


  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      siteTitle: siteTitle,
      email: parsedToken.email,
    }));

    $('#georap-signup-to-login-button').click(function (ev) {
      ev.preventDefault();
      // Open login form
      goLogin();
    });
    $('#georap-signup-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#georap-signup-to-login-button').off();
    $('#georap-signup-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    ev.preventDefault();

    // Hide previous errors
    (function hidePreviousErrors() {
      ui.hide($('#georap-signup-invalid-username'));
      ui.hide($('#georap-signup-password-no-match'));
      ui.hide($('#georap-signup-email-username-taken'));
    }());

    // Collect values to send
    var username = $('#georap-signup-username').val().trim();
    var password = $('#georap-signup-password').val();
    var password2 = $('#georap-signup-password2').val();

    // Validate username
    if (username === '') {
      // Invalid username, show error
      ui.show($('#georap-signup-invalid-username'));

      return;
    }  // else

    // Validate password
    if (password !== password2 || password === '') {
      // Invalid password, display error message
      ui.show($('#georap-signup-password-no-match'));

      return;
    }  // else

    // Okay, all good.

    // Display loading animation
    ui.show($('#georap-signup-in-progress'));
    // Hide form
    ui.hide($('#georap-signup-form'));

    accountStore.signup(token, username, password, responseHandler);
  };

  responseHandler = function (err) {
    // Hide loading animation
    ui.hide($('#georap-signup-in-progress'));

    if (!err) {
      // Show success message
      ui.show($('#georap-signup-success'));
      // Show button to continue to log in.
      ui.show($('#georap-signup-to-login'));

      return;
    }  // else

    if (err.message === 'Conflict') {
      // Duplicate username, show error.
      ui.show($('#georap-signup-email-username-taken'));
      // Show form
      ui.show($('#georap-signup-form'));

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // Expired token
      ui.show($('#georap-signup-token-error'));
      // Do not show the form because filling it again would still fail.

      return;
    }  // else

    // Other server error, show error message
    ui.show($('#georap-signup-server-error'));
  };

};
