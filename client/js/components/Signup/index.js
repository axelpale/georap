// A form for an invited user to sign up.

var account = require('../../stores/account');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');

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
      $('#tresdb-signup-invalid-username').addClass('hidden');
      $('#tresdb-signup-password-no-match').addClass('hidden');
      $('#tresdb-signup-email-username-taken').addClass('hidden');
    }());

    // Collect values to send
    var username = $('#tresdb-signup-username').val().trim();
    var password = $('#tresdb-signup-password').val();
    var password2 = $('#tresdb-signup-password2').val();

    // Validate username
    if (username === '') {
      // Invalid username, show error
      $('#tresdb-signup-invalid-username').removeClass('hidden');

      return;
    }  // else

    // Validate password
    if (password !== password2 || password === '') {
      // Invalid password, display error message
      $('#tresdb-signup-password-no-match').removeClass('hidden');

      return;
    }  // else

    // Okay, all good.

    // Display loading animation
    $('#tresdb-signup-in-progress').removeClass('hidden');
    // Hide form
    $('#tresdb-signup-form').addClass('hidden');

    account.signup(token, username, password, responseHandler);
  };

  responseHandler = function (err) {
    // Hide loading animation
    $('#tresdb-signup-in-progress').addClass('hidden');

    if (!err) {
      // Show success message
      $('#tresdb-signup-success').removeClass('hidden');
      // Show button to continue to log in.
      $('#tresdb-signup-to-login').removeClass('hidden');

      return;
    }  // else

    if (err.message === 'Conflict') {
      // Duplicate username, show error.
      $('#tresdb-signup-email-username-taken').removeClass('hidden');
      // Show form
      $('#tresdb-signup-form').removeClass('hidden');

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // Expired token
      $('#tresdb-signup-token-error').removeClass('hidden');
      // Do not show the form because filling it again would still fail.

      return;
    }  // else

    // Other server error, show error message
    $('#tresdb-signup-server-error').removeClass('hidden');
  };

};
