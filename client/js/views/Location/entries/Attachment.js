
var account = require('../../../stores/account');
var timestamp = require('../../lib/timestamp');
var template = require('./Attachment.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     any in models.entries

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

  this.render = function () {
    return template({
      entry: entry,
      account: account,
      timestamp: timestamp,
    });
  };

  this.bind = function () {

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

    $('#' + id + '-cancel').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();

  };

};
