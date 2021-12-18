var template = require('./template.ejs');
var emitter = require('component-emitter');
var components = require('georap-components');
var ui = require('georap-ui');
var themeStore = georap.stores.theme;
var localeStore = georap.stores.locale;
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
    $mount.html(template({
      theme: themeStore.get(),
      availableLocales: availableLocales,
    }));

    $elems.localeSelector = $mount.find('.locale-selector');
    $elems.localeErrorContainer = $mount.find('.locale-error-container');

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

    $elems.localeSelector.on('change', function () {
      var selectedLocale = $elems.localeSelector.val();
      localeStore.setLocale(selectedLocale, function (err) {
        if (err) {
          children.localeError = new components.Error(err.message);
          children.localeError.bind($elems.localeErrorContainer);
        }
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
