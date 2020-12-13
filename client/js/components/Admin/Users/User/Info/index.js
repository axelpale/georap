var template = require('./template.ejs');
var timestamp = require('timestamp');

module.exports = function (user) {
  this.bind = function ($mount) {
    $mount.html(template({
      timestamp: timestamp,
      createdAt: user.createdAt,
      loginAt: user.loginAt,
    }));
  };

  this.unbind = function () {
    // no-op
  };
};
