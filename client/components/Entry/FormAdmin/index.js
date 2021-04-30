// Entry form for non-owner admins.
// Admins can only delete other's entries.
//
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var RemoveForm = require('../Remove');
var MoveForm = require('../MoveForm');
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
  var $mount = null;
  var $elems = {};
  var children = {};
  var self = this;
  emitter(self);


  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entry: entry,
    }));

    $elems.cancelBtn = $mount.find('.entry-form-cancel');
    $elems.cancelBtn.click(function () {
      self.emit('exit');
    });

    $elems.removeOpen = $mount.find('.entry-remove-open');
    $elems.remove = $mount.find('.entry-remove-container');
    $elems.moveOpen = $mount.find('.entry-move-open');
    $elems.move = $mount.find('.entry-move-container');

    var pauseMs = 500;
    $elems.removeOpen.click(ui.throttle(pauseMs, function () {
      ui.toggleHidden($elems.remove);
    }));
    $elems.moveOpen.click(ui.throttle(pauseMs, function () {
      ui.toggleHidden($elems.move);
    }));

    // Remove entry
    children.remove = new RemoveForm({
      info: 'This will delete the post and ' +
        'all its attachments and comments if any.',
    });
    children.remove.bind($elems.remove);
    children.remove.on('submit', function () {
      entries.remove(entry.locationId, entry._id, function (err) {
        if (err) {
          children.remove.reset(); // hide progress and confirmation
          children.error.update(err.message);
          return;
        }

        // Success. The server will emit location_entry_removed
        self.emit('exit');
      });
    });

    // Move entry
    children.move = new MoveForm(entry);
    children.move.bind($elems.move);

    // Hide on cancel
    children.remove.on('exit', function () {
      ui.hide($elems.remove);
    });
    children.move.on('exit', function () {
      ui.hide($elems.move);
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
      $mount.empty();
      $mount = null;
    }
  };
};
