// A form for an invited user to sign up.

var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');

// Templates
var signupTemplate = require('../../templates/forms/signup.ejs');

module.exports = function (auth, token, goLogin) {
  // Parameters:
  //   auth
  //     Instance of auth.Service.
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

  this.render = function () {
    return signupTemplate({ email: parsedToken.email });
  };

  this.bind = function () {
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
      $('#tresdb-signup-username-taken').addClass('hidden');
      $('#tresdb-signup-email-taken').addClass('hidden');
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

    auth.signup(token, username, password, responseHandler);
  };

  responseHandler = function (err) {
    // Hide loading animation
    $('#tresdb-signup-in-progress').addClass('hidden');

    if (err === null) {
      // Show success message
      $('#tresdb-signup-success').removeClass('hidden');
      // Show button to continue to log in.
      $('#tresdb-signup-to-login').removeClass('hidden');

      return;
    }  // else

    if (err.name === 'UsernameTakenError') {
      // Duplicate username, show error.
      $('#tresdb-signup-username-taken').removeClass('hidden');
      // Show form
      $('#tresdb-signup-form').removeClass('hidden');

      return;
    }  // else

    if (err.name === 'EmailTakenError') {
      // Duplicate username, show error.
      $('#tresdb-signup-email-taken').removeClass('hidden');
      // Show log in button
      $('#tresdb-signup-to-login').removeClass('hidden');

      return;
    }  // else

    if (err.name === 'InvalidTokenError') {
      // Expired token
      $('#tresdb-signup-token-error').removeClass('hidden');
      // Do not show the form because filling it again would still fail.

      return;
    }  // else

    // Other server error, show error message
    $('#tresdb-signup-server-error').removeClass('hidden');
  };

};
