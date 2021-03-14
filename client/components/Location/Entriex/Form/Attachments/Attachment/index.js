var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var attachmentsApi = tresdb.stores.attachments;

module.exports = function (attachment) {

  var self = this;
  emitter(this);

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      attachment: attachment,
    }));

    $elems.up = $mount.find('.form-attachment-up');
    $elems.up.click(function () {
      self.emit('up');
    });

    $elems.down = $mount.find('.form-attachment-down');
    $elems.down.click(function () {
      self.emit('down');
    });

    $elems.remove = $mount.find('.form-attachment-remove');
    $elems.remove.click(function () {
      self.emit('remove');
    });

    $elems.rotate = $mount.find('.form-attachment-rotate');
    $elems.rotate.click(function () {
      var angle = 90;
      attachmentsApi.rotateImage(attachment.key, angle, function (err, att) {
        if (err) {
          var $err = $mount.find('.form-attachment-error');
          ui.show($err);
          $err.html('Attachment rotation failed: ' + err.message);
        }
        // Update image. Leave filename as is.
        $mount.find('img').attr('src', att.thumburl);
      });
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
