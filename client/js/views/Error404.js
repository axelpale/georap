
var template = require('../../templates/errors/error404.ejs');

module.exports = function () {

  this.render = function () {
    return template();
  };

  this.bind = function () {
    // Noop. For future, e.g. search
  };

  this.unbind = function () {
    // Noop
  };
};
