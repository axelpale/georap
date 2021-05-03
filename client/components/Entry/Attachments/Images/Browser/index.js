var template = require('./template.ejs');
var ui = require('georap-ui');
var emitter = require('component-emitter');

module.exports = function (attachments) {

  var self = this;
  emitter(self);

  var selectedIndex = 0;

  var $elems = {};

  this.bind = function ($mount) {
    if (attachments.length < 2) {
      // No browser for single image sets
      return;
    }

    $mount.html(template({
      attachments: attachments,
      selectedIndex: selectedIndex,
    }));

    var selectImage = function (index) {
      if (index === selectedIndex) {
        return; // No need to reselect. Avoids flicker.
      }

      if (index >= 0 && index < attachments.length) {
        selectedIndex = index;
        var selectedImage = attachments[selectedIndex];
        // Emphasize clicked and de-emphasize other images
        $mount.find('img').each(function (i, el) {
          if (selectedIndex === i) {
            el.className = 'active';
          } else {
            el.className = '';
          }
        });
        // Let Viewer know.
        self.emit('image_selected', selectedImage);
      }
    };

    var selectImageByKey = function (key) {
      var indexCandidate = attachments.findIndex(function (att) {
        return att.key === key;
      });
      if (indexCandidate >= 0) {
        selectImage(indexCandidate);
      }
    };

    $mount.on('click', function (ev) {
      var img = ev.target;
      if ('attachmentKey' in img.dataset) {
        selectImageByKey(img.dataset.attachmentKey);
      }
      // Allow key events
      $mount.focus();
    });

    // When mount has focus, enable arrow keys for navigation

    var ARROW_LEFT = 37;
    var ARROW_RIGHT = 39;
    $mount.keyup(function (ev) {
      if (ev.which === ARROW_LEFT) {
        selectImage(selectedIndex - 1);
      }

      if (ev.which === ARROW_RIGHT) {
        selectImage(selectedIndex + 1);
      }
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
