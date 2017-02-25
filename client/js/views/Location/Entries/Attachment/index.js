
var account = require('../../../../stores/account');
var timestamp = require('../../../lib/timestamp');
var template = require('./template.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Attachment, Story, or Visit model.

  var id = entry.getId();


  // Private methods

  var openForm = function () {
    $('#' + id + '-form-container').removeClass('hidden');
    // Hide all possible error messages
    $('#' + id + '-delete-error').addClass('hidden');
  };

  var isFormOpen = function () {
    var isHidden = $('#' + id + '-form-container').hasClass('hidden');
    return !isHidden;
  };

  var closeForm = function () {
    $('#' + id + '-form-container').addClass('hidden');
  };

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      entry: entry,
      account: account,
      timestamp: timestamp,
    }));

    $('#' + id + '-edit').click(function (ev) {
      ev.preventDefault();

      if (isFormOpen(id)) {
        closeForm(id);
      } else {
        openForm(id);
      }
    });

    $('#' + id + '-cancel').click(function (ev) {
      ev.preventDefault();

      closeForm(id);
    });

    $('#' + id + '-delete-ensure').click(function (ev) {
      ev.preventDefault();
      $('#' + id + '-delete-final').toggleClass('hidden');
    });

    $('#' + id + '-delete').click(function (ev) {
      ev.preventDefault();

      entry.remove(function (err) {
        closeForm(id);

        if (err) {
          // Show deletion failed error message
          $('#' + id + '-delete-error').removeClass('hidden');
          return;
        }
        // ON successful removal the location will emit entry_removed event
      });
    });

  };

  this.unbind = function () {

    $('#' + id + '-edit').off();
    $('#' + id + '-cancel').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();

  };

};
