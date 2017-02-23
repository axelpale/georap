// Story View
//
// Usage:
//   var s = new Story(api, auth);
//   s.render(node);
//   s.bind();

var marked = require('marked');
var account = require('../../../stores/account');
var timestamp = require('../../lib/timestamp');
var storyTemplate = require('./Story.ejs');
var markdownSyntax = require('../lib/markdownSyntax.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     models.Entry

  var id = entry.getId();


  // Private methods

  var onEdit = function (clickHandler) {
    var q = '#' + id + '-edit';
    $(q).click(function (ev) {
      ev.preventDefault();
      clickHandler();
    });
  };

  var offEdit = function () {
    var q = '#' + id + '-edit';
    $(q).off();
  };

  var isFormOpen = function () {
    var isHidden = $('#' + id + '-form-container').hasClass('hidden');
    return !isHidden;
  };

  var openForm = function () {
    $('#' + id + '-body').addClass('hidden');
    $('#' + id + '-form-container').removeClass('hidden');
    // Hide all possible error messages
    $('#' + id + '-error').addClass('hidden');
    $('#' + id + '-delete-error').addClass('hidden');
  };

  var prefillTextarea = function (content) {
    var textarea = $('#' + id + '-input');
    textarea.val(content);
    // Resize to content. See http://stackoverflow.com/a/13085420/638546
    textarea.height(textarea[0].scrollHeight);
  };

  var closeForm = function () {
    $('#' + id + '-form-container').addClass('hidden');
    $('#' + id + '-body').removeClass('hidden');
    $('#' + id + '-delete-final').addClass('hidden');
    // Hide all possible error messages
    $('#' + id + '-error').addClass('hidden');
    $('#' + id + '-delete-error').addClass('hidden');
  };


  // Public methods

  this.bind = function ($mount) {

    $mount.html(storyTemplate({
      entry: entry,
      marked: marked,  // markdown parser
      timestamp: timestamp,
      account: account,
      markdownSyntax: markdownSyntax,
    }));

    entry.on('markdown_changed', function () {
      var newParsed = marked(entry.getMarkdown(), { sanitize: true });
      $('#' + id + '-body').html(newParsed);
    });

    // If own story, display form
    if (entry.getUserName() === account.getName()) {
      // allow reveal of the edit form
      onEdit(function () {
        if (isFormOpen()) {
          closeForm();
        } else {
          openForm();
          prefillTextarea(entry.getMarkdown());
        }
      });

      $('#' + id + '-cancel').click(function (ev) {
        ev.preventDefault();

        closeForm();
      });

      $('#' + id + '-form').submit(function (ev) {
        ev.preventDefault();

        var newMarkdown = $('#' + id + '-input').val().trim();

        // Show progress bar and close the form.
        $('#' + id + '-progress').removeClass('hidden');
        closeForm();

        entry.setMarkdown(newMarkdown, function (err) {
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

    offEdit();
    entry.off('markdown_changed');
    $('#' + id + '-cancel').off();
    $('#' + id + '-form').off();
    $('#' + id + '-delete-ensure').off();
    $('#' + id + '-delete').off();
  };

};
