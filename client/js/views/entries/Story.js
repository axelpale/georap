// Story View
//
// Usage:
//   var s = new Story(api, auth);
//   s.render(node);
//   s.bind();

var marked = require('marked');
var timestamp = require('../lib/timestamp');
var storyTemplate = require('./story.ejs');
var markdownSyntax = require('../locationParts/markdownSyntax.ejs');

module.exports = function (entry, account) {
  // Parameters:
  //   entry
  //     models.Entry
  //   account
  //     models.Account

  // Private methods

  var onEdit = function (id, clickHandler) {
    var q = '#' + id + '-edit';
    $(q).click(function (ev) {
      ev.preventDefault();
      clickHandler();
    });
  };

  var offEdit = function (id) {
    var q = '#' + id + '-edit';
    $(q).off();
  };

  var isFormOpen = function (id) {
    var isHidden = $('#' + id + '-form-container').hasClass('hidden');
    return !isHidden;
  };

  var openForm = function (id) {
    $('#' + id + '-body').addClass('hidden');
    $('#' + id + '-form-container').removeClass('hidden');
  };

  var prefillTextarea = function (id, content) {
    var textarea = $('#' + id + '-input');
    textarea.val(content);
    // Resize to content. See http://stackoverflow.com/a/13085420/638546
    textarea.height(textarea[0].scrollHeight);
  };

  var closeForm = function (id) {
    $('#' + id + '-form-container').addClass('hidden');
    $('#' + id + '-body').removeClass('hidden');
  };


  // Public methods

  this.render = function () {
    return storyTemplate({
      entry: entry,
      marked: marked,  // markdown parser
      timestamp: timestamp,
      account: account,
      markdownSyntax: markdownSyntax,
    });
  };

  this.bind = function () {

    var id = entry.getId();

    entry.on('markdown_change', function () {
      var newParsed = marked(entry.getMarkdown(), { sanitize: true });
      $('#' + id + '-body').html(newParsed);
    });

    // If own story, display form
    if (entry.getUserName() === account.getName()) {
      // allow reveal of the edit form
      onEdit(id, function () {
        if (isFormOpen(id)) {
          closeForm(id);
        } else {
          openForm(id);
          prefillTextarea(id, entry.getMarkdown());
        }
      });

      $('#' + id + '-cancel').click(function (ev) {
        ev.preventDefault();

        closeForm(id);
      });

      $('#' + id + '-form').submit(function (ev) {
        ev.preventDefault();

        var newMarkdown = $('#' + id + '-input').val().trim();

        // Show progress bar and close the form.
        $('#' + id + '-progress').removeClass('hidden');
        closeForm(id);

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

      $('#' + id + '-delete').click(function (ev) {
        ev.preventDefault();
      });
    }

  };

  this.unbind = function () {
    offEdit(entry.getId());
  };

};
