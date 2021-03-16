var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');

module.exports = function (attachments) {

  var self = this;
  emitter(self);

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      attachments: attachments,
    }));

    $mount.on('click', function (ev) {
      if ('attachmentKey' in ev.target.dataset) {
        var selectedKey = ev.target.dataset.attachmentKey;
        var selectedImage = attachments.find(function (att) {
          return att.key === selectedKey;
        });
        self.emit('image_selected', selectedImage);
      }
      // TODO emphasize clicked
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
