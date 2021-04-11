var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var FormView = require('../../../Entry/Form');

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
  //       NOTE only location id is needed but the view generalization in
  //            Location/Forms forces location argument
  //
  var self = this;
  emitter(self);
  var children = {};

  var locationId = location._id;

  var startFormMemory = function () {
    formMemory[locationId] = {};
  };
  var getFormMemory = function () {
    return formMemory[locationId];
  };
  var setFormMemory = function (entryData) {
    if (entryData && locationId in formMemory) {
      formMemory[locationId] = entryData;
    }
  };
  var hasFormMemory = function () {
    return (locationId in formMemory);
  };
  var stopFormMemory = function () {
    delete formMemory[locationId];
  };

  self.bind = function ($mount) {
    $mount.html(template({}));

    if (hasFormMemory()) {
      children.form = new FormView(locationId, getFormMemory());
    } else {
      children.form = new FormView(locationId);
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
