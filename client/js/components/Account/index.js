var template = require('./template.ejs');
var emitter = require('component-emitter');
var themeStore = tresdb.stores.theme;

var colorSchemes = ['light', 'dark'];

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      theme: themeStore.get(),
    }));

    colorSchemes.forEach(function (colorScheme) {
      $('#theme-' + colorScheme).on('change', function () {
        themeStore.update({
          colorScheme: colorScheme,
        });
      });
    });
  };

  this.unbind = function () {
    colorSchemes.forEach(function (colorScheme) {
      $('#theme-' + colorScheme).off();
    });
  };
};
