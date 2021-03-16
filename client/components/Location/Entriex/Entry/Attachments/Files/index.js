// View for attachment browsing.
var template = require('./template.ejs');

module.exports = function (attachments) {

  var $mount = null;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    if (attachments.length === 0) {
      // No file attachments
      return;
    }

    $mount.html(template({
      attachments: attachments,
    }));
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
