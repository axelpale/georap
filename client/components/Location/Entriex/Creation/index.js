var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var FormView = require('../Form');

// Remember contents of unsubmitted forms during the session.
// Cases where necessary:
// - user fills the form but then exits to the map to search relevant info
// - user fills the form but cancels by accident or to continue later
//
var formMemory = {}; // locId -> entryData

module.exports = function (location) {
  // Parameters:
  //   location
  //     location object
  //
  var self = this;
  emitter(self);

  var children = {};

  var startFormMemory = function () {
    formMemory[location._id] = {};
  };
  var getFormMemory = function () {
    return formMemory[location._id];
  };
  var setFormMemory = function (entryData) {
    if (entryData && location._id in formMemory) {
      formMemory[location._id] = entryData;
    }
  };
  var hasFormMemory = function () {
    return (location._id in formMemory);
  };
  var stopFormMemory = function () {
    delete formMemory[location._id];
  };

  self.bind = function ($mount) {
    $mount.html(template({}));

    if (hasFormMemory()) {
      children.form = new FormView(location, getFormMemory());
    } else {
      children.form = new FormView(location);
      startFormMemory();
    }

    children.form.bind($mount.find('.entry-form-container'));

    children.form.once('exit', function () {
      setFormMemory(children.form.getEntryData({ complete: true }));
      self.emit('exit');
    });
    children.form.on('success', function () {
      stopFormMemory();
      self.emit('exit');
    });
  };

  self.unbind = function () {
    // Memorize form contents on sudden exit if memory not stopped.
    if (children.form && hasFormMemory()) {
      setFormMemory(children.form.getEntryData({ complete: true }));
    }
    // Unbind
    ui.unbindAll(children);
  };
};
