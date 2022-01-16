var template = require('./template.ejs');
var ui = require('georap-ui');
var locale = georap.i18n.locale;
var __ = georap.i18n.__;

module.exports = function (user) {
  this.bind = function ($mount) {
    $mount.html(template({
      email: user.email,
      createdAt: ui.timestamp(user.createdAt, locale),
      loginAt: ui.timestamp(user.loginAt, locale),
      __: __,
    }));
  };

  this.unbind = function () {
    // no-op
  };
};
