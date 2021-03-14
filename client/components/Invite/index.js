// Form to invite new users.

var inviteTemplate = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var validator = require('email-validator');
var account = tresdb.stores.account;

module.exports = function () {
  // Init
  emitter(this);

  // Private methods declaration

  var inviteAnotherButtonHandler;
  var inviteFormSubmitHandler;
  var inviteSubmitResponseHandler;


  // Public methods

  this.bind = function ($mount) {
    $mount.html(inviteTemplate());

    $('#tresdb-invite-another-button').click(inviteAnotherButtonHandler);
    $('#tresdb-invite-form').submit(inviteFormSubmitHandler);
  };

  this.unbind = function () {
    $('#tresdb-invite-another-button').off();
    $('#tresdb-invite-form').off();
  };


  // Private methods

  inviteAnotherButtonHandler = function (ev) {
    ev.preventDefault();
    // Reset the form
    ui.show($('#tresdb-invite-form'));
    ui.hide($('#tresdb-invite-success'));
    ui.hide($('#tresdb-invite-another'));
    $('#tresdb-invite-email').val('');
  };

  inviteFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Hide possible earlier error message
    ui.hide($('#tresdb-invite-email-error'));
    ui.hide($('#tresdb-invite-exist-error'));

    // Collect values to send
    var email = $('#tresdb-invite-email').val();

    // Validate email.
    if (!validator.validate(email)) {
      // Invalid email, show error.
      ui.show($('#tresdb-invite-email-error'));

      return;
    }  // else

    // Hide form
    ui.hide($('#tresdb-invite-form'));
    // Display loading animation
    ui.show($('#tresdb-invite-in-progress'));

    account.sendInviteEmail(email, inviteSubmitResponseHandler);
  };

  inviteSubmitResponseHandler = function (err) {
    // Hide loading animation
    ui.hide($('#tresdb-invite-in-progress'));

    if (err) {
      if (err.message === 'Conflict') {
        // Show error message.
        ui.show($('#tresdb-invite-exist-error'));
        // Show form
        ui.show($('#tresdb-invite-form'));

        return;
      }  // else

      // Show error message. Do not show form because the issue
      // probably does not solve by instant retry (leading to frustration).
      ui.show($('#tresdb-invite-server-error'));

      return;
    }  // else

    // Show success message
    ui.show($('#tresdb-invite-success'));
    // Show button to invite another user.
    ui.show($('#tresdb-invite-another'));
  };

};
