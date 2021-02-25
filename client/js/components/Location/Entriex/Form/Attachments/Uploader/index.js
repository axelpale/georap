var template = require('./template.ejs');

module.exports = function () {

  this.bind = function ($mount) {
    $mount.html(template({}));
  };

  this.unbind = function () {

  };
};
