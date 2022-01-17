
var account = georap.stores.account;
var config = georap.config;
var template = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var LanguagesComponent = require('./Languages');

var UNAUTHORIZED = 401;
var FORBIDDEN = 403;

module.exports = function (afterLoginUrl) {
  // Parameters:
  //   afterLoginUrl
  //

  // Init
  var self = this;
  var $mount = null;
  var $elems = {};
  var children = {};
  emitter(self);

  // Private methods.

  var loginResponseHandler = function (err) {
    // Hide the progress bar
    ui.hide($elems.progress);

    if (!err) {
      // Successful login
      georap.go(afterLoginUrl);
      return;
    }

    if (err.code === UNAUTHORIZED) {
      // Error message and form
      ui.show($elems.incorrect);
      ui.show($elems.form);
      ui.show($elems.languages);
      return;
    } // else

    if (err.code === FORBIDDEN) {
      // Show error for deactivated account. Keep login form hidden.
      var $msg = $elems.deactivated.find('.alert-message');
      $msg.html(err.message);
      ui.show($elems.deactivated);

      return;
    } // else

    // Show mystery error message. Do not show login form because
    // the issue is probably long-lasting.
    ui.show($elems.error);
  };

  var loginSubmitHandler = function (ev) {
    ev.preventDefault();

    // Get the input values
    var email = $elems.email.val();
    var password = $elems.password.val();

    // Clear possible earlier error messages
    ui.hide($elems.invalidEmail);
    ui.hide($elems.invalidPassword);
    ui.hide($elems.incorrect);
    ui.hide($elems.error);

    // Validate input
    if (email.length < 1) {
      ui.show($elems.invalidEmail);
      return;
    }
    if (password.length < 1) {
      ui.show($elems.invalidPassword);
      return;
    }

    // Okay, everything good. Start login process with the server.

    // Display the progress bar
    ui.show($elems.progress);
    // Hide the login form
    ui.hide($elems.form);
    // Hide Languages
    ui.hide($elems.languages);

    account.login(email, password, loginResponseHandler);
  };

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      loginColor: config.loginColor,
      __: georap.i18n.__,
    }));

    $elems.form = $mount.find('.login-form');
    $elems.email = $mount.find('#georap-login-email');
    $elems.password = $mount.find('#georap-login-password');
    $elems.invalidEmail = $mount.find('.login-invalid-email');
    $elems.invalidPassword = $mount.find('.login-invalid-password');
    $elems.deactivated = $mount.find('.login-deactivated');
    $elems.progress = $mount.find('.login-in-progress');
    $elems.incorrect = $mount.find('.login-incorrect');
    $elems.error = $mount.find('.login-server-error');

    $elems.languages = $mount.find('.available-languages');
    children.languages = new LanguagesComponent();
    children.languages.bind($elems.languages);

    $elems.form.submit(loginSubmitHandler);
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };

};
