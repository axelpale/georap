var ui = require('georap-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var FormView = require('../../../Entry/Form');

module.exports = function (location) {
  // Parameters:
  //   location
  //     location object
  //       NOTE only location id is needed but the view generalization in
  //            Location/Forms forces the full location argument
  //
  var self = this;
  emitter(self);
  var children = {};

  var locationId = location._id;

  self.bind = function ($mount) {
    $mount.html(template({
      __: georap.i18n.__,
    }));

    children.form = new FormView(locationId);
    children.form.bind($mount.find('.entry-form-container'));

    children.form.once('exit', function () {
      self.emit('exit');
    });
    children.form.once('success', function () {
      self.emit('exit');
    });
  };

  self.unbind = function () {
    ui.unbindAll(children);
    children = {};
  };
};
