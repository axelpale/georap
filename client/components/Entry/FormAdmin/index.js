// Entry form for non-owner admins.
// Admins can only delete other's entries.
//
var template = require('./template.ejs');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var entries = tresdb.stores.entries;

module.exports = function (locationId, entry) {
  // Entry deletion form View.
  //
  // Parameters:
  //   locationId
  //     location id string
  //   entry
  //     entry object
  //
  var self = this;
  emitter(self);

  var listeners = {};
  var children = {};

  self.bind = function ($mount) {

    $mount.html(template({
      entry: entry,
    }));

    listeners.deleteBtn = $mount.find('.entry-form-delete');
    listeners.deleteBtn.click(function () {
      // Confirm before delete
      ui.toggleHidden($mount.find('.entry-form-delete-confirm'));
    });

    listeners.deleteYesBtn = $mount.find('.entry-form-delete-yes');
    listeners.deleteYesBtn.click(function () {
      entries.remove(locationId, entry._id, function (err) {
        if (err) {
          // TODO show submit error
          return console.log(err);
        }
        self.emit('success');
      });
    });

    listeners.cancelBtn = $mount.find('.entry-form-cancel');
    listeners.cancelBtn.click(function () {
      self.emit('exit');
    });
  };

  self.unbind = function () {
    ui.offAll(listeners);
    ui.unbindAll(children);
  };
};
