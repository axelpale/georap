
var emitter = require('component-emitter');

// Templates
var template = require('../../templates/cards/loading.ejs');

module.exports = function () {

  // Init
  emitter(this);

  // Private methods declaration

  // Public methods

  this.render = function () {
    console.log('render loading');
    return template();
  };

  this.bind = function () {
    // noop
  };

  this.unbind = function () {
    // noop
  };

  // Private methods

};
