var template = require('./template.ejs');
var models = require('tresdb-models');
var rootBus = require('tresdb-bus');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.
  //
  var bus = models.entry.bus(entry, rootBus);

  // Public methods

  this.bind = function ($mount) {
    var render = function () {
      var firstImage = models.entry.getImage(entry);
      if (firstImage) {
        $mount.html(template({
          entryId: entry._id,
          thumbUrl: firstImage.thumbUrl,
          fileName: firstImage.filename,
        }));
      } else {
        // No image anymore. Hide.
        ui.hide($mount);
      }
    };

    render();
    bus.on('location_entry_changed', render);
  };

  this.unbind = function () {
    bus.off();
  };
};
