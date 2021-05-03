// Attachment thumbnail component
//
var template = require('./template.ejs');

var sizeToClass = {
  'xs': 'thumb-xs',
  'sm': 'thumb-sm',
  'md': 'thumb-md',
  'lg': 'thumb-lg',
  'xl': 'thumb-xl',
  'xxl': 'thumb-xxl',
};

module.exports = function (attachment, opts) {
  // Parameters:
  //   attachment
  //     attachment object
  //   opts, object with properties
  //     size
  //       optional string in ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].
  //       Size of the thumbnail. Default 'md'.
  //     makeLink
  //       optional boolean. True to make thumbnail a link.
  //     url
  //       optional string. If makeLink then use this url instead
  //       of the url to full-size attachment.
  //

  if (!opts) {
    opts = {};
  }

  opts = Object.assign({
    size: 'md',
    makeLink: false,
    url: null,
  }, opts);

  // Setup
  var $mount = null;
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      attachment: attachment,
      sizeClass: sizeToClass[opts.size],
      makeLink: opts.makeLink,
      url: opts.url ? opts.url : attachment.url,
    }));
  };

  self.update = function (att) {
    if ($mount) {
      attachment = att;

      $mount.html(template({
        attachment: attachment,
        sizeClass: sizeToClass[opts.size],
        makeLink: opts.makeLink,
        url: opts.url ? opts.url : attachment.url,
      }));
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
