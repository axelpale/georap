var template = require('./template.ejs');
var entryModel = require('../../../Entriex/Entry/model');
var attachmentModel = require('../../../Attachments/Attachment/model');
var bus = require('tresdb-bus');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.

  var route = null;

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      entry: entry,
    }));

    var route = bus.on(
      'location_entry_changed',
      entryModel.handlerFor(entry, function (ev) {
        // If entry still has an image, replace the image.
        var firstImage = entryModel.getImage(entry);
        if (firstImage) {
          var $img = $mount.find('img');
          $img.attr('src', attachmentModel.getThumbUrl(firstImage));
          $img.attr('title', attachmentModel.getFileName(firstImage));
        } else {
          // No image anymore. Hide.
          ui.hide($mount);
        }
      })
    );
  };

  this.unbind = function () {
    bus.off(route);
  };
};
