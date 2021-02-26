var emitter = require('component-emitter');

module.exports = function (file) {

  this.file = file;

  emitter(this);
};
