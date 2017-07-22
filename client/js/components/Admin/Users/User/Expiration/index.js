var template = require('./template.ejs');

module.exports = function (user) {

  this.bind = function ($mount) {

    $mount.html(template({
      expirationDate: '2017-12-12',
    }));

  };

  this.unbind = function () {
  };
};
