var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var account = georap.stores.account;
var themeStore = georap.stores.theme;
var localesStore = georap.stores.locales;
var availableLocales = georap.config.availableLocales;

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
    var user = account.getUser();
    $mount.html(template({
      theme: themeStore.get(),
      username: user.name,
      email: user.email,
      currentLocale: localesStore.getLocale(),
      availableLocales: availableLocales,
      __: georap.i18n.__,
    }));

    colorSchemes.forEach(function (colorScheme, i) {
      var elemid = 'theme-' + colorScheme;
      $elems[elemid] = $('#' + elemid);
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

  this.unbind = function () {
    ui.offAll($elems);
    $elems = {};
    ui.unbindAll(children);
    children = {};
  };
};
