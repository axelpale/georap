
var template = require('./template.ejs');
var emitter = require('component-emitter');
var account = georap.stores.account;
var __ = georap.i18n.__;

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
      __: __,
    }));
  };

  this.unbind = function () {
    // noop
  };

};
