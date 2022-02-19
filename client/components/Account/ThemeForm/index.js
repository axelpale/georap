var ui = require('georap-ui');
var template = require('./template.ejs');
var themeStore = georap.stores.theme;

var colorSchemes = ['light', 'dark'];
var themeColors = ['white', '#111111'];

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      theme: themeStore.get(),
      __: georap.i18n.__,
    }));

    colorSchemes.forEach(function (colorScheme, i) {
      var elemid = 'theme-' + colorScheme;
      $elems[elemid] = $mount.find('#' + elemid);
      $elems[elemid].click(ui.throttle(1000, function (ev) {
        // No navigation
        ev.preventDefault();
        // Switch theme dynamically
        themeStore.update({
          colorScheme: colorScheme,
          themeColor: themeColors[i],
        });
        // Hacky but simple way to refresh selection-star
        $mount.find('.color-schemes .glyphicon-star').appendTo($elems[elemid]);
      }));
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
