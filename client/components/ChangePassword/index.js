
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var account = georap.stores.account;

module.exports = function () {

  // Init
  emitter(this);

  // Private methods declaration

  var submitHandler;
  var responseHandler;


  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      user: account.getUser(),
    }));

    $('#georap-change-password-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#georap-change-password-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var curPass = $('#georap-input-current-password').val();
    var newPass = $('#georap-input-new-password').val();
    var agaPass = $('#georap-input-again-password').val();

    // Clear possible earlier error messages
    ui.hide($('#georap-change-password-invalid-curpass'));
    ui.hide($('#georap-change-password-invalid-newpass'));
    ui.hide($('#georap-change-password-incorrect-curpass'));
    ui.hide($('#georap-change-password-server-error'));

    // Validate input
    if (curPass === '') {
      ui.show($('#georap-change-password-invalid-curpass'));

      return;
    } // else
    if (newPass === '' || newPass !== agaPass) {
      ui.show($('#georap-change-password-invalid-newpass'));

      return;
    } // else

    // Okay, everything good. Request server to change password.

    // Display the progress bar
    ui.show($('#georap-change-password-in-progress'));
    // Hide the form
    ui.hide($('#georap-change-password-form'));

    account.changePassword(curPass, newPass, responseHandler);
  };

  responseHandler = function (err) {

    // Hide the progress bar
    ui.hide($('#georap-change-password-in-progress'));

    if (err) {
      if (err.message === 'Unauthorized') {
        // Show form and error message.
        ui.show($('#georap-change-password-form'));
        ui.show($('#georap-change-password-incorrect-curpass'));
        return;
      }  // else

      // A rare error. Show error:
      ui.show($('#georap-change-password-server-error'));
      $('#georap-change-password-server-error-name').text(err.message);
      return;
    }  // else

    // Successfully changed. Show success message. No need to show form.
    ui.show($('#georap-change-password-success'));
    return;
  };

};
