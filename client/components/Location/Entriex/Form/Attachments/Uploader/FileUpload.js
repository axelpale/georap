var emitter = require('component-emitter');
var uploadSizeLimit = tresdb.config.uploadSizeLimit;
var idCounter = 0;
var MB = 1024 * 1024;

module.exports = function (file) {
  emitter(this);

  this.id = 'file' + idCounter;
  idCounter += 1;

  this.file = file;

  this.valid = true;
  this.validatorError = '';

  // Validate the file. In future maybe add mimetype restrictions.
  if (file.size > uploadSizeLimit) {
    this.valid = false;
    this.validatorError = 'This file exceeds the upload size limit ' +
      'of ' + (uploadSizeLimit / MB).toFixed(1) + ' MiB';
  }
};
