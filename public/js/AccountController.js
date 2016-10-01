
// Template
var accountTemplate = require('../templates/account.ejs');
var alertTemplate = require('../templates/alert.ejs');

module.exports = function (card, auth) {
  // Parameters:
  //   card
  //     Instance of CardController. To fill a card.
  //   auth

  card.open(accountTemplate({
    user: auth.getPayload(),
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

      var curPassGroup = card.findElementById('tresdb-current-password-group');
      var newPassGroup = card.findElementById('tresdb-new-password-group');
      var agaPassGroup = card.findElementById('tresdb-again-password-group');
      var curPass = $('#tresdb-input-current-password').val();
      var newPass = $('tresdb-input-new-password').val();
      var agaPass = $('tresdb-input-again-password').val();

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

      auth.changePassword(curPass, newPass, function cb(err) {

        if (err) {
          console.error(err);
          $('#tresdb-change-password-alert').html(alertTemplate({
            msg: 'There was a problem in changing the password. ' +
              'Please ensure the values are correct and try again.',
            context: 'danger',
          }));

          return;
        }  // else

        console.log('Password changed successfully.');
        $('#tresdb-change-password-alert').html(alertTemplate({
          msg: 'Password changed successfully.',
          context: 'success',  // Bootstrap alert context class
        }));

        $passwordForm.addClass('hidden');
      });
    });
  }());
};
