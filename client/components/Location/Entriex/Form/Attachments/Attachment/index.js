var template = require('./template.ejs');
var thumbnailTemplate = require('./thumbnail.ejs');
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
      thumbnailHtml: thumbnailTemplate({
        attachment: attachment,
      }),
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
        // Rotation creates a new attachment.
        attachment = att;
        // Update key in dom so that entry save can read it.
        $mount.find('.form-attachment').attr('data-attachment-key', att.key);
        // Update image. Filename stays the same.
        $mount.find('.form-attachment-thumbnail').html(thumbnailTemplate({
          attachment: att,
        }));
      });
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
