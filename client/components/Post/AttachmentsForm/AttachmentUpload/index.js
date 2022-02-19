var template = require('./template.ejs');
var ui = require('georap-ui');
var __ = georap.i18n.__;

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
      __: __,
    }));

    $elems.bar = $mount.find('.progress-bar');
    $elems.cancel = $mount.find('.upload-controls .btn-cancel');

    fileupload.on('progress', function (percentage) {
      $elems.bar.css('width', percentage + '%');
    });

    fileupload.on('error', function (err) {
      if (!fileupload.cancelled) {
        // Turn red
        // Show error
        // Allow close
        console.error(err);
      }
      // cancelled, no real error.
    });

    fileupload.on('success', function () {
      // Flash green success.
      // Converted to an attachment in the parent.
      // Hide.
    });

    fileupload.on('cancel', function () {
      // React to self or sibling cancel.
      // Stop the animation
      $elems.bar.removeClass(['progress-bar-striped', 'active']);
      // Hide the cancel button to show that the command took hold
      ui.hide($elems.cancel);
    });

    $elems.cancel.click(function () {
      // Cancel the upload
      fileupload.cancel();
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
