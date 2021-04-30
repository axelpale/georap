// View for attachment browsing.
var FilesView = require('./Files');
var ImagesView = require('./Images');
var template = require('./template.ejs');
var attachmentsModel = require('georap-models').attachments;
var ui = require('tresdb-ui');

module.exports = function (entry, attachments) {

  var children = {};
  var $elems = {};
  var $mount = null;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    if (attachments.length === 0) {
      // No need to render anything
      return;
    }

    $mount.html(template({}));

    $elems.files = $mount.find('.entry-files-container');
    $elems.images = $mount.find('.entry-images-container');

    var files = attachmentsModel.getNonImages(attachments);
    var images = attachmentsModel.getImages(attachments);

    children.files = new FilesView(files);
    children.files.bind($elems.files);

    children.images = new ImagesView(images);
    children.images.bind($elems.images);
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      ui.offAll($elems);
      $mount = null;
    }
  };
};
