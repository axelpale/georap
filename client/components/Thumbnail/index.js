var template = require('./template.ejs');

module.exports = function (attachment, opts) {

  if (!opts) {
    opts = {
      makeLink: false,
    };
  }

  if (typeof opts.makeLink !== 'boolean') {
    opts.makeLink = false;
  }

  // Setup
  var $mount = null;
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      attachment: attachment,
      makeLink: opts.makeLink,
    }));
  };

  self.update = function (att) {
    if ($mount) {
      attachment = att;

      $mount.html(template({
        attachment: attachment,
        makeLink: opts.makeLink,
      }));
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
