var Emitter = require('component-emitter');

module.exports = function () {
  // Parameters:
  //   -
  //
  // Emits:
  //   update
  //     On menu change

  Emitter(this);
  var self = this;

  this.setMenu = function (menu) {
    self.emit('update', menu);
  };
};
