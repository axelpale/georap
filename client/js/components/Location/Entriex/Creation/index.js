var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var FormView = require('../Form');

// eslint-disable-next-line no-unused-vars
module.exports = function (location) {
  // Parameters:
  //   location
  //     location object
  //
  var self = this;
  emitter(self);

  var children = {};

  self.bind = function ($mount) {
    children.form = new FormView(location);
    children.form.bind($mount);

    children.form.once('exit', function () {
      self.emit('exit');
    });
    // children.form.on('submit', function (entryData) {
    //
    // });
  };

  self.unbind = function () {
    ui.unbindAll(children);
  };
};
