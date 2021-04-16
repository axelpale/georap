var template = require('./template.ejs');
var Thumbnail = require('georap-components').Thumbnail;
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var attachmentsApi = tresdb.stores.attachments;

module.exports = function (attachment) {

  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(this);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      sizestamp: ui.sizestamp(attachment.filesize),
      attachment: attachment,
    }));

    $elems.thumb = $mount.find('.form-attachment-thumbnail');
    children.thumb = new Thumbnail(attachment);
    children.thumb.bind($elems.thumb);

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
        children.thumb.update(att);
      });
    });
  };

  this.getAttachment = function () {
    return attachment;
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
