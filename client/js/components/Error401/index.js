
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  self.bind = function ($mount) {
    $mount.html(template());
  };

  self.unbind = function () {
    // Noop
  };
};
