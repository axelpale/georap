var template = require('./template.ejs');
var entryModel = require('../../../Entriex/Entry/model');
var attachmentModel = require('../../../Attachments/Attachment/model');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.
  //
  var bus = entryModel.bus(entry);

  // Public methods

  this.bind = function ($mount) {
    var render = function () {
      var firstImage = entryModel.getImage(entry);
      if (firstImage) {
        $mount.html(template({
          entryId: entry._id,
          thumbUrl: attachmentModel.getThumbUrl(firstImage),
          fileName: attachmentModel.getFileName(firstImage),
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
