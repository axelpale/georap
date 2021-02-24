/* eslint-disable */
// View for attachment upload and listing.
// Pluggable into Entry and Comments

module.exports = function (entry, attachments) {

  this.bind = function ($mount) {
    attachments.forEach(function (att) {
      $mount.append('<p>' + att.filename + '</p>');
    });
  };

  this.unbind = function () {

  };

  this.getAttachments = function () {
    // Return list of attachment keys
  };

  this.setAttachmentKeys = function (keys) {
    // Fetch?
  };
};
