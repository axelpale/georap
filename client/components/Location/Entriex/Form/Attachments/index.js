// View for attachment upload and listing.
// Pluggable into Entry and Comments
var AttachmentView = require('./Attachment');
var AttachmentUploadView = require('./AttachmentUpload');
var UploaderView = require('./Uploader');
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (entry, attachments) {

  var children = {};
  var $mount = null;

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({}));

    var $uploaderContainer = $mount.find('.uploader-container');

    var appendAttachment = function (att) {
      // Container for attachment form
      var $attContainer = $('<li></li>');
      $attContainer.addClass([
        'list-group-item',
        'form-attachment-container',
      ]);
      $uploaderContainer.before($attContainer);
      children[att.key] = new AttachmentView(att);
      children[att.key].bind($attContainer);

      children[att.key].on('up', function () {
        $attContainer.insertBefore(
          $attContainer.prev('.form-attachment-container')
        );
      });
      children[att.key].on('down', function () {
        $attContainer.insertAfter(
          $attContainer.next('.form-attachment-container')
        );
      });
      children[att.key].on('remove', function () {
        children[att.key].unbind();
        delete children[att.key];
        $attContainer.remove();
      });
    };

    var appendAttachmentUpload = function (fileupload) {
      var $attContainer = $('<li></li>');
      $attContainer.addClass([
        'list-group-item',
        'form-attachment-upload-container',
      ]);
      $uploaderContainer.before($attContainer);
      children[fileupload.id] = new AttachmentUploadView(fileupload);
      children[fileupload.id].bind($attContainer);
      // Convert to attachment if success
      fileupload.on('success', function (attachment) {
        appendAttachment(attachment);
        // Remove progress bar
        children[fileupload.id].unbind();
        delete children[fileupload.id];
        $attContainer.remove();
      });
    };

    attachments.forEach(appendAttachment);

    // Upload form
    children.uploader = new UploaderView();
    children.uploader.bind($mount.find('.uploader-container'));
    // For each file uploaded, create a progress bar.
    children.uploader.on('fileupload', appendAttachmentUpload);
  };

  this.getAttachmentKeys = function () {
    // Return list of attachment keys
    // To ensure correct order, read from dom
    if ($mount) {
      var $keys = $mount.find('.form-attachment').map(function (i, attEl) {
        return attEl.dataset.attachmentKey;
      });
      return $keys.get(); // convert to plain array
    }
    return [];
  };

  this.setAttachmentKeys = function () {
    // Fetch?
  };

  this.unbind = function () {
    ui.unbindAll(children);
    $mount = null;
  };
};
