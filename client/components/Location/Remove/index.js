
var account = tresdb.stores.account;
var template = require('./template.ejs');
var ui = require('georap-ui');

module.exports = function (location) {

  var $mount = null;
  var $elems = {};
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    // Allow only admins and creators to delete.
    if (!account.isAdmin() && location.getCreator() !== account.getName()) {
      return;
    }

    $mount.html(template({
      location: location,
    }));

    $elems.ensure = $('#tresdb-location-delete-ensure');
    $elems.final = $('#tresdb-location-delete-final');
    $elems.del = $('#tresdb-location-delete');
    $elems.error = $('#tresdb-location-delete-error');
    $elems.progress = $('#tresdb-location-delete-progress');

    $elems.ensure.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($elems.final);
    });

    $elems.del.click(function (ev) {
      ev.preventDefault();

      // Prevent user clicking the deletion again
      ui.hide($elems.final);
      // Show progress bar
      ui.show($elems.progress);

      location.remove(function (err) {
        if (err) {
          // Remove progress
          ui.hide($elems.progress);
          // Show deletion failed error message
          ui.show($elems.error);
        }
        // ON successful removal the location will emit "location_removed" event
        // and the card will close the Location component.
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };

};
