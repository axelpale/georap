
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var account = tresdb.stores.account;

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

    $('#tresdb-change-password-form').submit(submitHandler);
  };

  this.unbind = function () {
    $('#tresdb-change-password-form').off();
  };


  // Private methods

  submitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var curPass = $('#tresdb-input-current-password').val();
    var newPass = $('#tresdb-input-new-password').val();
    var agaPass = $('#tresdb-input-again-password').val();

    // Clear possible earlier error messages
    ui.hide($('#tresdb-change-password-invalid-curpass'));
    ui.hide($('#tresdb-change-password-invalid-newpass'));
    ui.hide($('#tresdb-change-password-incorrect-curpass'));
    ui.hide($('#tresdb-change-password-server-error'));

    // Validate input
    if (curPass === '') {
      ui.show($('#tresdb-change-password-invalid-curpass'));

      return;
    } // else
    if (newPass === '' || newPass !== agaPass) {
      ui.show($('#tresdb-change-password-invalid-newpass'));

      return;
    } // else

    // Okay, everything good. Request server to change password.

    // Display the progress bar
    ui.show($('#tresdb-change-password-in-progress'));
    // Hide the form
    ui.hide($('#tresdb-change-password-form'));

    account.changePassword(curPass, newPass, responseHandler);
  };

  responseHandler = function (err) {

    // Hide the progress bar
    ui.hide($('#tresdb-change-password-in-progress'));

    if (err) {
      if (err.message === 'Unauthorized') {
        // Show form and error message.
        ui.show($('#tresdb-change-password-form'));
        ui.show($('#tresdb-change-password-incorrect-curpass'));
        return;
      }  // else

      // A rare error. Show error:
      ui.show($('#tresdb-change-password-server-error'));
      $('#tresdb-change-password-server-error-name').text(err.message);
      return;
    }  // else

    // Successfully changed. Show success message. No need to show form.
    ui.show($('#tresdb-change-password-success'));
    return;
  };

};
