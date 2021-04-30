var template = require('./template.ejs');
var ui = require('georap-ui');

module.exports = function (user) {
  this.bind = function ($mount) {
    $mount.html(template({
      timestamp: ui.timestamp,
      createdAt: user.createdAt,
      loginAt: user.loginAt,
    }));
  };

  this.unbind = function () {
    // no-op
  };
};
