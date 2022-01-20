var template = require('./template.ejs');
var ui = require('georap-ui');
var components = require('georap-components');
var NameForm = require('./NameForm');
var able = georap.stores.account.able;
var __ = georap.i18n.__;

module.exports = function (location) {

  var $mount = null;
  var children = {};
  var $elems = {};
  var handleNameChange;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      location: location,
      able: able,
      __: __,
    }));

    $elems.display = $mount.find('.location-name-display');
    $elems.show = $mount.find('.location-rename-show'); // button
    $elems.formContainer = $mount.find('.location-rename-form-container');

    // Listen for events

    handleNameChange = function () {
      var newName = location.getName();
      var s = (newName === '' ? __('untitled') : newName);
      $elems.display.text(s);
    };
    location.on('location_name_changed', handleNameChange);

    // Rename form

    if (able('locations-update')) {
      var nameForm = new NameForm(location);
      children.formOpener = new components.Opener(nameForm, false);
      children.formOpener.bind({
        $container: $elems.formContainer,
        $button: $elems.show,
      });
    }
  };

  this.unbind = function () {
    if ($mount) {
      location.off('location_name_changed', handleNameChange);
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };
};
