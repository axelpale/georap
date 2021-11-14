// A form for an invited user to sign up.

var account = tresdb.stores.account;
var template = require('./template.ejs');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode').default;
var ui = require('georap-ui');

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
      siteTitle: tresdb.config.title,
      email: parsedToken.email,
    }));

    $('#tresdb-signup-to-login-button').click(function (ev) {
      ev.preventDefault();
      // Open login form
      goLogin();
    });
    $('#tresdb-signup-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#tresdb-signup-to-login-button').off();
    $('#tresdb-signup-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    ev.preventDefault();

    // Hide previous errors
    (function hidePreviousErrors() {
      ui.hide($('#tresdb-signup-invalid-username'));
      ui.hide($('#tresdb-signup-password-no-match'));
      ui.hide($('#tresdb-signup-email-username-taken'));
    }());

    // Collect values to send
    var username = $('#tresdb-signup-username').val().trim();
    var password = $('#tresdb-signup-password').val();
    var password2 = $('#tresdb-signup-password2').val();

    // Validate username
    if (username === '') {
      // Invalid username, show error
      ui.show($('#tresdb-signup-invalid-username'));

      return;
    }  // else

    // Validate password
    if (password !== password2 || password === '') {
      // Invalid password, display error message
      ui.show($('#tresdb-signup-password-no-match'));

      return;
    }  // else

    // Okay, all good.

    // Display loading animation
    ui.show($('#tresdb-signup-in-progress'));
    // Hide form
    ui.hide($('#tresdb-signup-form'));

    account.signup(token, username, password, responseHandler);
  };

  responseHandler = function (err) {
    // Hide loading animation
    ui.hide($('#tresdb-signup-in-progress'));

    if (!err) {
      // Show success message
      ui.show($('#tresdb-signup-success'));
      // Show button to continue to log in.
      ui.show($('#tresdb-signup-to-login'));

      return;
    }  // else

    if (err.message === 'Conflict') {
      // Duplicate username, show error.
      ui.show($('#tresdb-signup-email-username-taken'));
      // Show form
      ui.show($('#tresdb-signup-form'));

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // Expired token
      ui.show($('#tresdb-signup-token-error'));
      // Do not show the form because filling it again would still fail.

      return;
    }  // else

    // Other server error, show error message
    ui.show($('#tresdb-signup-server-error'));
  };

};
