
var template = require('./template.ejs');

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
