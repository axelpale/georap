/* eslint-disable */
// View for attachment upload and listing.
// Pluggable into Entry and Comments
var AttachmentView = require('./Attachment');
var UploaderView = require('./Uploader');
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (entry, attachments) {

  var children = {};

  this.bind = function ($mount) {
    $mount.html(template({}));

    var $list = $mount.find('.form-attachments-list');

    var appendAttachment = function (att) {
      // Container for attachment form
      var $attContainer = $('<li></li>');
      $attContainer.addClass('list-group-item form-attachment-container');
      $list.append($attContainer);
      children[att.key] = new AttachmentView(att);
      children[att.key].bind($attContainer);
    };

    attachments.forEach(appendAttachment);

    children.uploader = new UploaderView(function (err, newAttachments) {
      if (err) {
        return console.error(err);
      }
      newAttachments.forEach(appendAttachment);
    });
    children.uploader.bind($mount.find('.uploader-container'));
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };

  this.getAttachments = function () {
    // Return list of attachment keys
  };

  this.setAttachmentKeys = function (keys) {
    // Fetch?
  };
};
