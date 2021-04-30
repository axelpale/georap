var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var entryFlags = tresdb.config.entryFlags;

module.exports = function (selectedFlags) {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      flagBoxes: Object.keys(entryFlags).map(function (flagName) {
        return {
          name: flagName,
          description: entryFlags[flagName].description,
          checked: selectedFlags.indexOf(flagName) > -1,
        };
      }),
    }));
  };

  self.getFlags = function () {
    if ($mount) {
      // Find selected flags
      var checkedFlags = $mount
        .find('input:checked')
        .map(function (i, boxEl) {
          return boxEl.value;
        })
        .get();
      return checkedFlags;
    }
    return [];
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
