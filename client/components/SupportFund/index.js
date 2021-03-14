/* eslint-disable max-statements */
// View for location

var emitter = require('component-emitter');

// Templates
var template = require('./template.ejs');

module.exports = function () {
  // Parameters
  //
  // Emits
  //   idle
  //     when view is rendered and bound
  //   removed
  //     when model emits "removed"

  // Init
  var self = this;
  emitter(self);

  // State:
  // NO state

  // Public methods

  self.bind = function ($mount) {
    // Loading
    $mount.html(template({
      tresdb: tresdb, // for page content
    }));
  };  // end bind

  self.unbind = function () {
  };

};
