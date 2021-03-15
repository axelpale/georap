// View for attachment browsing.
var AttachmentView = require('./Attachment');
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (entry, attachments) {

  var children = {};
  var $elems = {};
  var $mount = null;

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({}));

    $elems.list = $mount.find('.entry-attachments-list');

    var appendAttachment = function (att) {
      // Container for attachment form
      var $attContainer = $('<li></li>');
      $attContainer.addClass([
        'list-group-item',
        'form-attachment-container',
      ]);
      $elems.list.append($attContainer);
      children[att.key] = new AttachmentView(att);
      children[att.key].bind($attContainer);
    };

    attachments.forEach(appendAttachment);
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      ui.offAll($elems);
      $mount = null;
    }
  };
};
