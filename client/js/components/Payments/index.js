// This is the form the user arrives via the link in a password reset email.

var account = require('../../stores/account');
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template({
      email: account.getEmail(),
      balance: 25.00,
      username: account.getName(),
    }));

  };

  this.unbind = function () {
    // noop
  };

};
