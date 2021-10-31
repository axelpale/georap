var emitter = require('component-emitter');
var uploadSizeLimit = tresdb.config.uploadSizeLimit;
var idCounter = 0;
var MB = 1024 * 1024;

module.exports = function (file) {
  var self = this;
  emitter(this);
  // possible events: progress, cancel, success, error

  this.id = 'file' + idCounter;
  idCounter += 1;

  this.file = file;

  this.valid = true;
  this.validatorError = '';

  this.cancelled = false;

  // Validate the file. In future maybe add mimetype restrictions.
  if (file.size > uploadSizeLimit) {
    this.valid = false;
    this.validatorError = 'This file exceeds the upload size limit ' +
      'of ' + (uploadSizeLimit / MB).toFixed(1) + ' MiB';
  }

  this.cancel = function () {
    if (!this.cancelled) {
      this.cancelled = true;
      self.emit('cancel');
    }
  };
};
