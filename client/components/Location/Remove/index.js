
var account = tresdb.stores.account;
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (location) {

  this.bind = function ($mount) {

    // Allow only admins and creators to delete.
    if (!account.isAdmin() && location.getCreator() !== account.getName()) {
      return;
    }

    $mount.html(template({
      location: location,
    }));

    var $ensure = $('#tresdb-location-delete-ensure');
    var $final = $('#tresdb-location-delete-final');
    var $del = $('#tresdb-location-delete');
    var $error = $('#tresdb-location-delete-error');
    var $progress = $('#tresdb-location-delete-progress');

    $ensure.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($final);
    });

    $del.click(function (ev) {
      ev.preventDefault();

      // Prevent user clicking the deletion again
      ui.hide($final);
      // Show progress bar
      ui.show($progress);

      location.remove(function (err) {
        if (err) {
          // Remove progress
          ui.hide($progress);
          // Show deletion failed error message
          ui.show($error);
        }
        // ON successful removal the location will emit "location_removed" event
        // and the card will close the Location component.
      });
    });
  };

  this.unbind = function () {
    $('#tresdb-location-delete-ensure').off();
    $('#tresdb-location-delete').off();
  };

};
