var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var self = this;

  var _changeHandler = null;

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      entry: entry,
    }));

    _changeHandler = function (ev) {
      // If entry still has an image, replace the image.
      if (entry.hasImage()) {
        var $img = $mount.find('img');
        $img.attr('src', entry.getThumbUrl());
        $img.attr('title', entry.getFileName());
      } else {
        // No image anymore. Hide.
        ui.hide($mount);
      }
    };

    entry.on('location_entry_changed', _changeHandler);
  };

  this.unbind = function () {
    entry.off('location_entry_changed', _changeHandler);
  };
};
