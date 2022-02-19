var emitter = require('component-emitter');
var template = require('./template.ejs');
var content = georap.config.supportPageContent;

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
      content: content,
      __: georap.i18n.__,
    }));
  };

  self.unbind = function () {
    // noop
  };

};
