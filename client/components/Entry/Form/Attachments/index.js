// View for attachment upload and listing.
// Pluggable into Entry and Comments
var AttachmentView = require('./Attachment');
var AttachmentUploadView = require('./AttachmentUpload');
var UploaderView = require('./Uploader');
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (attachments, opts) {
  // Parameters:
  //   attachments
  //     sdf
  //   opts, object with props
  //     label
  //       String label above drag-n-drop box. Set null or '' to disable.
  //       Default ''.
  //     limit
  //       zero or positive number. Defaults to 100.
  //
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    label: '',
    limit: 100, // Artificial value ~ Infinity
  }, opts);

  var self = this;
  var children = {};
  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      label: opts.label,
    }));

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
    children.uploader = new UploaderView({
      filter: function () {
        // HACK filtered (accepted) upload will emit 'fileupload'
        // which calls appendAttachmentUpload
        // which creates a .form-attachment-upload
        // and create an element so that getAttachmentKeys
        // keeps on track at each filter step.
        var numUploaded = $mount.find('.form-attachment').length;
        var numUploading = $mount.find('.form-attachment-upload').length;
        return numUploaded + numUploading < opts.limit;
      },
    });
    children.uploader.bind($mount.find('.uploader-container'));
    // For each file uploaded, create a progress bar.
    children.uploader.on('fileupload', appendAttachmentUpload);
  };

  self.getAttachments = function () {
    var keys = this.getAttachmentKeys();
    return keys.map(function (key) {
      return children[key].getAttachment();
    });
  };

  self.getAttachmentKeys = function () {
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

  self.setAttachmentKeys = function () {
    // Fetch?
  };

  self.unbind = function () {
    ui.unbindAll(children);
    $mount = null;
  };
};
