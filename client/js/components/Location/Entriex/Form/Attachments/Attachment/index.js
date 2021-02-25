var template = require('./template.ejs');

module.exports = function (attachment) {

  this.bind = function ($mount) {
    $mount.html(template({
      attachment: attachment,
    }));
  };

  this.unbind = function () {

  };
};
