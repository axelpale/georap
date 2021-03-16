var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');

module.exports = function (attachments) {

  var self = this;
  emitter(self);

  var $elems = {};

  this.bind = function ($mount) {
    if (attachments.length < 2) {
      // No browser for single image sets
      return;
    }

    $mount.html(template({
      attachments: attachments,
    }));

    $mount.on('click', function (ev) {
      var img = ev.target;
      if ('attachmentKey' in img.dataset) {
        var selectedKey = img.dataset.attachmentKey;
        var selectedImage = attachments.find(function (att) {
          return att.key === selectedKey;
        });
        self.emit('image_selected', selectedImage);
        // Emphasize clicked
        $mount.find('img').removeClass('active');
        img.className = 'active';
        img.focus();
      }
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
