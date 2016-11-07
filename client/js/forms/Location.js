var marked = require('marked');
var timestamp = require('./lib/timestamp');

// Templates
var locationTemplate = require('../../templates/forms/location.ejs');

module.exports = function (loc, api) {
  // Parameters
  //   loc
  //     Location object
  //   api
  //     locations.Service instance

  // Init

  // Sort content, newest first, create-event to bottom.
  loc.content.sort(function comp(a, b) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time > b.time) {
      return -1;
    }
    if (a.type === 'created') {
      return 1;
    }
    return 0;
  });

  // Private methods declaration

  // Public methods

  this.render = function () {

    return locationTemplate({
      location: loc,
      marked: marked,
      timestamp: timestamp,
    });
  };

  this.bind = function () {

    $('#tresdb-location-rename-show').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-rename-form').toggleClass('hidden');
      // Remove possible error messages
      $('#tresdb-location-rename-error').addClass('hidden');
    });

    $('#tresdb-location-rename-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-rename-form').addClass('hidden');
    });

    $('#tresdb-location-rename-form').submit(function (ev) {
      ev.preventDefault();

      var newName = $('#tresdb-location-rename-input').val();
      api.rename(loc._id, newName.trim(), function (err, updatedLoc) {
        if (err) {
          console.error(err);
          $('#tresdb-location-rename-form').addClass('hidden');
          $('#tresdb-location-rename-error').removeClass('hidden');
        }

        $('#tresdb-location-rename-form').addClass('hidden');
        $('#tresdb-location-name').text(updatedLoc.name);  // madness for mvc
      });
    });
  };


  // Private methods

};
