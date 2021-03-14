var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function (attachment) {

  var self = this;
  emitter(this);

  this.bind = function ($mount) {
    $mount.html(template({
      attachment: attachment,
    }));

    $mount.find('.form-attachment-up').click(function () {
      self.emit('up');
    });
    $mount.find('.form-attachment-down').click(function () {
      self.emit('down');
    });
    $mount.find('.form-attachment-remove').click(function () {
      self.emit('remove');
    });
  };

  this.unbind = function () {

  };
};
