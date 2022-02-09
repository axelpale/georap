var template = require('./template.ejs');
var ui = require('georap-ui');
var Opener = require('georap-components').Opener;
var NameForm = require('./NameForm');
var account = georap.stores.account;
var ableOwn = account.ableOwn;
var __ = georap.i18n.__;

module.exports = function (location) {

  var $mount = null;
  var children = {};
  var $elems = {};
  var handleNameChange;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var loc = location.getRaw(); // transition to no-model
    var locName = (loc.name ? loc.name : __('untitled'));
    var ableEdit = ableOwn(loc, 'locations-update');

    $mount.html(template({
      locName: locName,
      ableEdit: ableEdit,
      __: __,
    }));

    $elems.display = $mount.find('.location-name-display');
    $elems.open = $mount.find('.location-rename-open'); // button
    $elems.formContainer = $mount.find('.location-rename-form-container');

    // Listen for events

    handleNameChange = function () {
      var newName = location.getName();
      var s = (newName === '' ? __('untitled') : newName);
      $elems.display.text(s);
    };
    location.on('location_name_changed', handleNameChange);

    // Rename form

    if (ableEdit) {
      var nameForm = new NameForm(location);
      children.formOpener = new Opener(nameForm);
      children.formOpener.bind({
        $container: $elems.formContainer,
        $button: $elems.open,
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
