
var template = require('./Error404.ejs');

module.exports = function () {

  this.render = function () {
    return template();
  };

  this.bind = function () {
    // Noop
  };

  this.unbind = function () {
    // Noop
  };
};
