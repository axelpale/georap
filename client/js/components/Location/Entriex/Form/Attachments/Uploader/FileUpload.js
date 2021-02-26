var emitter = require('component-emitter');
var idCounter = 0;

module.exports = function (file) {

  this.id = 'file' + idCounter;
  idCounter += 1;

  this.file = file;

  emitter(this);
};
