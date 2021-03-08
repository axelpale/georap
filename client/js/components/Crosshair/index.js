// Component to filter map markers.
//
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var TitleView = require('./Title');
var FormView = require('./Form');

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self); // Every card must be an emitter to be able to detect close
  var children = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    children.title = new TitleView();
    children.title.bind($mount.find('.crosshair-title-container'));

    children.form = new FormView();
    children.form.bind($mount.find('.crosshair-form-container'));
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };
};
