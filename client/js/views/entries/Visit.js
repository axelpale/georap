
var timestamp = require('../lib/timestamp');
var template = require('./visit.ejs');

module.exports = function (entry, account) {

  var id = entry.getId();


  // Private methods

  var isFormOpen = function () {
    var isHidden = $('#' + id + '-form-container').hasClass('hidden');
    return !isHidden;
  };

  var openForm = function () {
    $('#' + id + '-form-container').removeClass('hidden');
    // Hide all possible error messages
    $('#' + id + '-error').addClass('hidden');
    $('#' + id + '-delete-error').addClass('hidden');
  };

  var closeForm = function () {
    $('#' + id + '-form-container').addClass('hidden');
    $('#' + id + '-delete-final').addClass('hidden');
    // Hide all possible error messages
    $('#' + id + '-error').addClass('hidden');
    $('#' + id + '-delete-error').addClass('hidden');
  };

  var prefill = function () {
    var year = entry.getYear();
    $('#' + id + '-input').val(year.toString());
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
    entry.on('year_changed', function () {
      var newYear = entry.getYear().toString();
      $('#' + id + '-year').html(newYear);
    });

    if (entry.getUserName() === account.getName()) {

      $('#' + id + '-edit').click(function (ev) {
        ev.preventDefault();

        if (isFormOpen()) {
          closeForm();
        } else {
          openForm();
          prefill();
        }
      });

      $('#' + id + '-cancel').click(function (ev) {
        ev.preventDefault();

        closeForm();
      });

      $('#' + id + '-form').submit(function (ev) {
        ev.preventDefault();

        var year = $('#' + id + '-input').val();
        year = parseInt(year, 10);

        // Show progress bar and close the form.
        $('#' + id + '-progress').removeClass('hidden');
        closeForm();

        entry.setYear(year, function (err) {
          // Hide progress bar
          $('#' + id + '-progress').addClass('hidden');

          if (err) {
            // Show error message
            $('#' + id + '-error').removeClass('hidden');
            return;
          }
        });
      });

      $('#' + id + '-delete-ensure').click(function (ev) {
        ev.preventDefault();
        $('#' + id + '-delete-final').toggleClass('hidden');
      });

      $('#' + id + '-delete').click(function (ev) {
        ev.preventDefault();

        entry.remove(function (err) {
          if (err) {
            // Show deletion failed error message
            closeForm();
            $('#' + id + '-delete-error').removeClass('hidden');
            return;
          }
          // ON successful removal the location will emit entry_removed event
        });
      });
    }
  };

  this.unbind = function () {
    entry.off('year_changed');
    if (entry.getUserName() === account.getName()) {
      $('#' + id + '-edit').off();
      $('#' + id + '-form').off();
      $('#' + id + '-cancel').off();
      $('#' + id + '-delete').off();
      $('#' + id + '-delete-ensure').off();
    }
  };

};
