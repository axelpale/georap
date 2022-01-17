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
  var $mount = null;
  var $elems = {};
  emitter(this);

  var parsedToken = jwtDecode(token);
  // Note: server will check if token still fresh. No need to check it here
  // and duplicate the information about duration.


  // Private method declaration

  var submitHandler;
  var responseHandler;


  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      email: parsedToken.email,
      __: georap.i18n.__,
    }));

    // Initialize log in button that will be shown after successful reset.
    $elems.afterResetLogin = $mount.find('.reset-password-login');
    $elems.continue = $mount.find('.continue-to-login-button');
    $elems.continue.click(function (ev) {
      ev.preventDefault();
      return showLogin();
    });

    $elems.form = $mount.find('.reset-password-form');
    $elems.form.submit(submitHandler);

    $elems.progress = $mount.find('.reset-in-progress');
    $elems.password = $mount.find('#georap-input-new-password');
    $elems.passwordAgain = $mount.find('#georap-input-again-password');
    $elems.noMatchError = $mount.find('.reset-password-no-match');
    $elems.serverError = $mount.find('.reset-password-server-error');
    $elems.tokenError = $mount.find('.reset-password-token-error');
    $elems.success = $mount.find('.reset-password-success');
  };

  this.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $mount.empty();
      $mount = null;
    }
  };


  // Private methods

  submitHandler = function (ev) {
    // User has typed in two passwords and submitted the form.
    ev.preventDefault();

    var password = $elems.password.val();
    var passwordAgain = $elems.passwordAgain.val();

    // Validate
    if (password !== passwordAgain || password === '') {
      // Display error message
      ui.show($elems.noMatchError);

      return;
    }  // else

    // Reveal loading animation.
    ui.show($elems.progress);
    // Hide the password form.
    ui.hide($elems.form);
    // Hide possible earlier no-match error message
    ui.hide($elems.noMatchError);

    account.resetPassword(token, password, responseHandler);
  };

  responseHandler = function (err) {
    if (!err) {
      // Successful reset
      // Reveal success message
      ui.show($elems.success);
      // Reveal "Continue to log in" button
      ui.show($elems.afterResetLogin);
      // Hide the loading animation
      ui.hide($elems.progress);

      return;
    }  // else

    if (err.message === 'Unauthorized') {
      // False token
      // Display token error message.
      ui.show($elems.tokenError);
      // Reveal "Continue to log in" button
      ui.show($elems.afterResetLogin);
      // Hide the loading animation
      ui.hide($elems.progress);

      return;
    }  // else

    // Invalid password (too short?)
    // Invalid email (no such account)
    // Server down
    // Database down
    console.error(err);
    // Display error message.
    ui.show($elems.serverError);
    // Display the original form
    ui.show($elems.form);
    // Hide the loading animation
    ui.hide($elems.progress);
  };

};
