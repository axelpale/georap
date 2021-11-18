// Form to invite new users.

var inviteTemplate = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var validator = require('email-validator');
var account = georap.stores.account;

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

    $('#georap-invite-another-button').click(inviteAnotherButtonHandler);
    $('#georap-invite-form').submit(inviteFormSubmitHandler);
  };

  this.unbind = function () {
    $('#georap-invite-another-button').off();
    $('#georap-invite-form').off();
  };


  // Private methods

  inviteAnotherButtonHandler = function (ev) {
    ev.preventDefault();
    // Reset the form
    ui.show($('#georap-invite-form'));
    ui.hide($('#georap-invite-success'));
    ui.hide($('#georap-invite-another'));
    $('#georap-invite-email').val('');
  };

  inviteFormSubmitHandler = function (ev) {
    ev.preventDefault();

    // Hide possible earlier error message
    ui.hide($('#georap-invite-email-error'));
    ui.hide($('#georap-invite-exist-error'));

    // Collect values to send
    var email = $('#georap-invite-email').val();

    // Validate email.
    if (!validator.validate(email)) {
      // Invalid email, show error.
      ui.show($('#georap-invite-email-error'));

      return;
    }  // else

    // Hide form
    ui.hide($('#georap-invite-form'));
    // Display loading animation
    ui.show($('#georap-invite-in-progress'));

    account.sendInviteEmail(email, inviteSubmitResponseHandler);
  };

  inviteSubmitResponseHandler = function (err) {
    // Hide loading animation
    ui.hide($('#georap-invite-in-progress'));

    if (err) {
      if (err.message === 'Conflict') {
        // Show error message.
        ui.show($('#georap-invite-exist-error'));
        // Show form
        ui.show($('#georap-invite-form'));

        return;
      }  // else

      // Show error message. Do not show form because the issue
      // probably does not solve by instant retry (leading to frustration).
      ui.show($('#georap-invite-server-error'));

      return;
    }  // else

    // Show success message
    ui.show($('#georap-invite-success'));
    // Show button to invite another user.
    ui.show($('#georap-invite-another'));
  };

};
