
var account = tresdb.stores.account;
var template = require('./template.ejs');

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
      $final.toggleClass('hidden');
    });

    $del.click(function (ev) {
      ev.preventDefault();

      // Prevent user clicking the deletion again
      $final.addClass('hidden');
      // Show progress bar
      $progress.removeClass('hidden');

      location.remove(function (err) {
        if (err) {
          // Remove progress
          $progress.addClass('hidden');

          // Show deletion failed error message
          $error.removeClass('hidden');
          return;
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
