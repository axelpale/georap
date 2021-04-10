
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var entries = tresdb.stores.entries;

module.exports = function (entry) {
  // Entry removal button and confirmation.
  //
  // Parameters:
  //   entry
  //     entry object
  //

  var self = this;
  emitter(self);

  var $elems = {};

  self.bind = function ($mount) {
    $mount.html(template({}));

    $elems.confirmation = $mount.find('.form-remove-confirmation');
    $elems.progress = $mount.find('.form-remove-progress');

    $elems.open = $mount.find('button.form-remove-open');
    $elems.open.click(function () {
      ui.toggleHidden($elems.confirmation);
    });

    $elems.removeBtn = $mount.find('button.form-remove-btn');
    $elems.removeBtn.click(function () {
      ui.hide($elems.confirmation);
      ui.show($elems.progress);
      entries.remove(entry.locationId, entry._id, function (err) {
        ui.hide($elems.progress);
        if (err) {
          // Handle with form error view
          return self.emit('error', err);
        }
        return self.emit('success');
        // ON successful removal the server will emit
        // location_entry_removed event
      });
    });
  };

  self.unbind = function () {
    ui.offAll($elems);
  };
};
