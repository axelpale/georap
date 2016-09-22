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

  this.setMenu = function (menu, user) {
    // Parameters:
    //   menu
    //     menu object
    //   user
    //     Auth token payload
    self.emit('update', menu, user);
  };
};
