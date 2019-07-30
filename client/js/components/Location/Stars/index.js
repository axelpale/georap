var template = require('./template.ejs');
var ui = require('../../lib/ui');
var account = require('../../../stores/account');
// var tagsListTemplate = require('./tagsList.ejs');
// var statusFormListTemplate = require('./statusFormList.ejs');
// var tagsFormListTemplate = require('./tagsFormList.ejs');

module.exports = function (location) {
  var self = this;

  this.bind = function ($mount) {
    $mount.html(template({
      stars: location.getStars(),
      starred: (location.getStars().indexOf(account.getName()) > -1),
    }));

    var $give = $('#tresdb-location-stars-give');
    var $undo = $('#tresdb-location-stars-undo');
    var $progress = $('#tresdb-location-stars-progress');
    var $error = $('#tresdb-location-stars-error');

    location.on('location_stars_changed', function () {
      // Refresh
      $mount.empty();
      self.bind($mount);
    });

    $give.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      ui.hide($error);

      ui.show($progress);
      ui.hide($give);

      location.setStars(true, function (errset) {
        ui.hide($progress);

        if (errset) {
          console.error(errset);
          ui.show($error);
          return;
        }
        // Everything ok
      });
    });

    $undo.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      ui.hide($error);

      ui.show($progress);
      ui.hide($undo);

      location.setStars(false, function (errset) {
        ui.hide($progress);

        if (errset) {
          console.error(errset);
          ui.show($error);
          return;
        }
        // Everything ok
      });
    });
  };

  this.unbind = function () {
    location.off('location_stars_changed');
    $('#tresdb-location-stars-give').off();
    $('#tresdb-location-stars-undo').off();
  };
};
