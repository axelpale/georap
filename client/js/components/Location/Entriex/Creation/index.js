var ui = require('tresdb-ui');
var FormView = require('../Form');

module.exports = function (location) { /* eslint-disable-line no-unused-vars */
  // Parameters:
  //   location
  //     location object
  //
  var children = {};

  this.bind = function ($mount) {
    children.form = new FormView();
    children.form.bind($mount);

    // children.form.on('submit', function (entryData) {
    //
    // });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };
};
