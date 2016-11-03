
// Templates
var passwordTemplate = require('../../templates/forms/changePassword.ejs');

module.exports = function (auth) {
  // Parameters:
  //   auth
  //     Instance of auth.Service


  // Private methods declaration

  var submitHandler;
  var responseHandler;


  // Public methods

  this.render = function () {
    return passwordTemplate({
      user: auth.getUser(),
    });
  };

  this.bind = function () {
    $('#tresdb-change-password-form').submit(submitHandler);
  };


  // Private methods

  submitHandler = function (ev) {
    ev.preventDefault();

    // Get input values
    var curPass = $('#tresdb-input-current-password').val();
    var newPass = $('#tresdb-input-new-password').val();
    var agaPass = $('#tresdb-input-again-password').val();

    // Clear possible earlier error messages
    $('#tresdb-change-password-invalid-curpass').addClass('hidden');
    $('#tresdb-change-password-invalid-newpass').addClass('hidden');
    $('#tresdb-change-password-incorrect-curpass').addClass('hidden');
    $('#tresdb-change-password-server-error').addClass('hidden');

    // Validate input
    if (curPass === '') {
      $('#tresdb-change-password-invalid-curpass').removeClass('hidden');

      return;
    } // else
    if (newPass === '' || newPass !== agaPass) {
      $('#tresdb-change-password-invalid-newpass').removeClass('hidden');

      return;
    } // else

    // Okay, everything good. Request server to change password.

    // Display the progress bar
    $('#tresdb-change-password-in-progress').removeClass('hidden');
    // Hide the form
    $('#tresdb-change-password-form').addClass('hidden');

    auth.changePassword(curPass, newPass, responseHandler);
  };

  responseHandler = function (err) {

    // Hide the progress bar
    $('#tresdb-change-password-in-progress').addClass('hidden');

    if (err === null) {
      // Successfully changed. Show success message. No need to show form.
      $('#tresdb-change-password-success').removeClass('hidden');

      return;
    }  // else

    if (err.name === 'IncorrectPasswordError') {
      // Show form and error message.
      $('#tresdb-change-password-form').removeClass('hidden');
      $('#tresdb-change-password-incorrect-curpass').removeClass('hidden');

      return;
    }  // else

    // A rare error. Show error:
    $('#tresdb-change-password-server-error').removeClass('hidden');
    $('#tresdb-change-password-server-error-name').text(err.name);

  };

};
