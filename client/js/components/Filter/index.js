// Component for filters for map and search results.

var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self);


  // Public methods

  this.bind = function ($mount) {
    $mount.html(template());
  };

  this.unbind = function () {
    // noop
  };

};
