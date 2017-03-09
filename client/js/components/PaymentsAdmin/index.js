// Payments Management UI

var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template());

  };

  this.unbind = function () {
    // noop
  };

};
