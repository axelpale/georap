var template = require('./template.ejs');

module.exports = function (fileupload) {

  this.bind = function ($mount) {
    $mount.html(template({
      filename: fileupload.file.name,
      filesize: Math.round(fileupload.file.size / 1024),
      isValid: fileupload.valid,
      validatorError: fileupload.validatorError,
    }));

    var $bar = $mount.find('.progress-bar');

    fileupload.on('progress', function (percentage) {
      $bar.css('width', percentage + '%');
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
    fileupload.off();
  };
};
