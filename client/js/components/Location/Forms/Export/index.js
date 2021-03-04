
var template = require('./template.ejs');
var emitter = require('component-emitter');
var account = tresdb.stores.account;
var ui = require('tresdb-ui');

module.exports = function (location) {

  var self = this;
  emitter(self);

  var listeners = {};

  self.bind = function ($mount) {
    // Render
    $mount.html(template({
      id: location.getId(),
      token: account.getToken(),
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
