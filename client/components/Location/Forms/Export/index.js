
var template = require('./template.ejs');
var emitter = require('component-emitter');
var account = georap.stores.account;
var ui = require('georap-ui');

module.exports = function (location) {
  // Parameters:
  //   location
  //     a location object
  //

  var self = this;
  emitter(self);

  var listeners = {};

  self.bind = function ($mount) {
    // Token is not needed if download is publicly allowed.
    var tokenQuery = '';
    if (account.hasToken()) {
      tokenQuery = '&amp;token=' + account.getToken();
    }
    // Render
    $mount.html(template({
      id: location._id,
      tokenQuery: tokenQuery,
      __: georap.i18n.__,
    }));

    listeners.cancel = $mount.find('.location-export-cancel');
    listeners.cancel.click(function () {
      self.emit('exit');
    });
  };

  self.unbind = function () {
    ui.offAll(listeners);
  };

};
