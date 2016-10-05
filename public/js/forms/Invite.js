// Form to invite new users.

var validator = require('email-validator');

// Templates
var inviteTemplate = require('../../templates/forms/invite.ejs');

module.exports = function (auth) {
  // Parameters:
  //   auth
  //     Instance of auth.Service.


  // Private methods declaration

  var inviteAnotherButtonHandler;
  var inviteFormSubmitHandler;
  var inviteSubmitResponseHandler;


  // Public methods

  this.render = function () {
    return inviteTemplate();
  };

  this.bind = function () {
    $('#tresdb-invite-another-button').click(inviteAnotherButtonHandler);
    $('#tresdb-invite-form').submit(inviteFormSubmitHandler);
  };


  // Private methods

  inviteAnotherButtonHandler = function (ev) {
    ev.preventDefault();
    // Reset the form
    $('#tresdb-invite-form').removeClass('hidden');
    $('#tresdb-invite-success').addClass('hidden');
    $('#tresdb-invite-another').addClass('hidden');
    $('#tresdb-invite-email').val('');
  };

  inviteFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Hide possible earlier error message
    $('#tresdb-invite-email-error').addClass('hidden');
    $('#tresdb-invite-exist-error').addClass('hidden');

    // Collect values to send
    var email = $('#tresdb-invite-email').val();

    // Validate email.
    if (!validator.validate(email)) {
      // Invalid email, show error.
      $('#tresdb-invite-email-error').removeClass('hidden');

      return;
    }  // else

    // Hide form
    $('#tresdb-invite-form').addClass('hidden');
    // Display loading animation
    $('#tresdb-invite-in-progress').removeClass('hidden');

    auth.sendInviteEmail(email, inviteSubmitResponseHandler);
  };

  inviteSubmitResponseHandler = function (err) {
    // Hide loading animation
    $('#tresdb-invite-in-progress').addClass('hidden');

    if (err) {
      if (err.name === 'AccountExistsError') {
        // Show error message.
        $('#tresdb-invite-exist-error').removeClass('hidden');
        // Show form
        $('#tresdb-invite-form').removeClass('hidden');

        return;
      }  // else
      // Show error message. Do not show form because the issue
      // probably does not solve by instant retry (leading to frustration).
      $('#tresdb-invite-server-error').removeClass('hidden');

      return;
    }  // else

    // Show success message
    $('#tresdb-invite-success').removeClass('hidden');
    // Show button to invite another user.
    $('#tresdb-invite-another').removeClass('hidden');
  };

};
