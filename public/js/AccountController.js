
// Template
var accountTemplate = require('../templates/account.ejs');
var alertTemplate = require('../templates/alert.ejs');

module.exports = function (card, auth) {
  // Parameters:
  //   card
  //     Instance of CardController. To fill a card.
  //   auth

  card.open(accountTemplate({
    user: auth.getPayload()
  }));

  var passwordForm = card.findElementById('tresdb-change-password-form');
  var $passwordForm = $(passwordForm);

  (function defineHowToOpenPasswordForm() {
    var passid = 'tresdb-show-change-password-form';
    var showPasswordFormButton = card.findElementById(passid);
    $(showPasswordFormButton).click(function () {
      $passwordForm.toggleClass('hidden');
    });
  }());

  (function defineHowToSubmitPasswordForm() {
    $passwordForm.submit(function (ev) {
      ev.preventDefault();
      console.log('Change password form submitted.');

      var alertContainer = card.findElementById('tresdb-change-password-alert');
      var infoContainer = card.findElementById('tresdb-change-password-info');

      var curPassGroup = card.findElementById('tresdb-current-password-group');
      var newPassGroup = card.findElementById('tresdb-new-password-group');
      var agaPassGroup = card.findElementById('tresdb-again-password-group');
      var curPassEl = card.findElementById('tresdb-input-current-password');
      var newPassEl = card.findElementById('tresdb-input-new-password');
      var agaPassEl = card.findElementById('tresdb-input-again-password');
      var curPass = curPassEl.value;
      var newPass = newPassEl.value;
      var agaPass = agaPassEl.value;

      // Validate
      if (curPass === '') {
        $(curPassGroup).addClass('has-error');
        return;
      } // else
      $(curPassGroup).removeClass('has-error');
      if (newPass === '' || newPass !== agaPass) {
        $(newPassGroup).addClass('has-error');
        $(agaPassGroup).addClass('has-error');
        return;
      } // else
      $(newPassGroup).removeClass('has-error');
      $(agaPassGroup).removeClass('has-error');

      console.log('About to ask auth to change password.');
      auth.changePassword(curPass, newPass, function cb(err) {
        var msg;

        if (err) {
          console.error(err);
          msg = 'There was a problem in changing the password. '
            + 'Please ensure the values are correct and try again.';
          alertContainer.innerHTML = alertTemplate({
            msg: msg,
            context: 'danger'
          })
          return;
        }
        console.log('Password changed successfully.');
        infoContainer.innerHTML = alertTemplate({
          msg: 'Password changed successfully.',
          context: 'success'  // Bootstrap alert context class
        });
        $passwordForm.addClass('hidden');
      });
    });
  }());
};
