var template = require('./template.ejs');

module.exports = function (user) {

  this.bind = function ($mount) {

    $mount.html(template({
      isAdmin: user.admin,
    }));

  };

  this.unbind = function () {
  };
};
