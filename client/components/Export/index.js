
var template = require('./template.ejs');
var emitter = require('component-emitter');
var account = georap.stores.account;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self);


  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      token: account.getToken(),
    }));
  };

  this.unbind = function () {
    // noop
  };

};
