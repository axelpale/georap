
// Template
var accountTemplate = require('../templates/account.ejs');

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

      auth.changePassword(oldPassword, newPassword, function cb(err) {
        if (err) {
          console.error(err);
        }
        console.log('Password changed.');
      });
    });
  }());
};
