var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var themeStore = georap.stores.theme;

var colorSchemes = ['light', 'dark'];
var themeColors = ['white', '#111111'];

module.exports = function () {

  // Init
  var self = this;
  emitter(self);
  var $elems = {};
  var children = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      theme: themeStore.get(),
    }));

    colorSchemes.forEach(function (colorScheme, i) {
      var elemid = 'theme-' + colorScheme;
      $elems[elemid] = $('#' + elemid);
      $elems[elemid].on('change', function () {
        themeStore.update({
          colorScheme: colorScheme,
          themeColor: themeColors[i],
        });
      });
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
    $elems = {};
    ui.unbindAll(children);
    children = {};
  };
};
