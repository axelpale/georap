var template = require('./template.ejs');
var ui = require('georap-ui');

module.exports = function (fileupload) {

  var $mount = null;
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      filename: fileupload.file.name,
      filesize: Math.round(fileupload.file.size / 1024),
      isValid: fileupload.valid,
      validatorError: fileupload.validatorError,
    }));

    $elems.bar = $mount.find('.progress-bar');

    fileupload.on('progress', function (percentage) {
      $elems.bar.css('width', percentage + '%');
    });

    fileupload.on('error', function (err) {
      // Turn red
      // Show error
      // Allow close
      console.error(err);
    });

    fileupload.on('success', function () {
      // Flash green success.
      // Convert to Attachment somehow.
      // Hide.
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      fileupload.off();
      ui.offAll($elems);
      $elems = {};
    }
  };
};
