// Form to invite new users.

// Templates
var inviteTemplate = require('../templates/invite.ejs');
var alertTemplate = require('../templates/alert.ejs');

module.exports = function (card, auth) {
  // Parameters:
  //   card
  //     Instance of CardController.
  //     To close login form card on successful login.
  //   auth
  //     Instance of AuthController.

  card.open(inviteTemplate(), 'page');
};
