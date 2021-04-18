var emitter = require('component-emitter');
var uic = require('georap-components');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var Progress = uic.Progress;
var ErrorView = uic.Error;
var entryApi = tresdb.stores.entries;

module.exports = function (entry) {
  // Parameters
  //   entry
  //     entry object to move
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));

    $elems.form = $mount.find('.entry-move-form');

    $elems.open = $mount.find('.entry-move-open');
    var pauseMs = 500;
    $elems.open.click(ui.throttle(pauseMs, function () {
      ui.toggleHidden($elems.form);
    }));

    $elems.cancel = $mount.find('.entry-move-cancel');
    $elems.cancel.click(function () {
      ui.hide($elems.form);
    });

    children.progress = new Progress();
    $elems.progress = $mount.find('.entry-move-progress');

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var selectedLocId = null;

      children.progress.bind($elems.progress);

      entryApi.move({
        entryId: entry._id,
        from: entry.locationId,
        to: selectedLocId,
      }, function (err) {
        children.progress.unbind();
        if (err) {
          children.error = new ErrorView(err.message);
          children.error.bind($mount.find('move-error'));
          return;
        }
        // Success. The server will emit location_entry_moved
        self.emit('success');
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
