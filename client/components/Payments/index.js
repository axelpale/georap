
var template = require('./template.ejs');
var emitter = require('component-emitter');
var account = georap.stores.account;

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
