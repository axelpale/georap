
var template = require('./remove.ejs');

module.exports = function (location) {

  // Private methods

  // Public methods

  this.render = function () {
    return template({
      location: location,
    });
  };

  this.bind = function () {

    $('#tresdb-location-delete-ensure').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-delete-final').toggleClass('hidden');
    });

    $('#tresdb-location-delete').click(function (ev) {
      ev.preventDefault();

      location.remove(function (err) {
        if (err) {
          // Show deletion failed error message
          $('#tresdb-location-delete-final').addClass('hidden');
          $('#tresdb-location-delete-error').removeClass('hidden');
          return;
        }
        // ON successful removal the location will emit "removed" event
      });
    });
  };

  this.unbind = function () {

    $('#tresdb-location-delete-ensure').off();
    $('#tresdb-location-delete').off();
  };

};
