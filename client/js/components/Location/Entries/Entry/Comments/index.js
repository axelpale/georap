var template = require('./template.ejs');
var CommentView = require('./Comment');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var _commentViewsMap = {};
  var $els = [];
  var entryId = entry.getId();

  // Public methods

  this.bind = function ($mount) {
    var comments = entry.getComments();

    $mount.html(template({
      entryId: entryId,
    }));

    var $commentsEl = $mount.children().first();
    var $commentForm = $mount.find('.entry-comment-form-container').first();
    var $entryFooter = $('#' + entryId + '-footer');

    comments.forEach(function (comment) {
      var commentId = comment.id;
      var v = new CommentView(entry, comment);

      _commentViewsMap[commentId] = v;

      $commentsEl.append('<div id="comment-' + commentId + '"></div>');
      v.bind($('#comment-' + commentId));
    });

    var $openCommentForm = $('#' + entryId + '-open-comment-form');
    $openCommentForm.click(function (ev) {
      ev.preventDefault();

      // Show the form; Hide the footer
      $commentForm.removeClass('hidden');
      $entryFooter.addClass('hidden');
    });

    var $cancel = $mount.find('#' + entryId + '-comment-cancel-btn');
    $cancel.click(function (ev) {
      ev.preventDefault();

      // Hide the form; Show the footer
      $commentForm.addClass('hidden');
      $entryFooter.removeClass('hidden');
    });

    $commentForm.submit(function (ev) {
      ev.preventDefault();

      var textInput = $commentForm.find('#' + entryId + '-comment-text-input');
      var message = textInput.val();
      entry.createComment(message, function (err) {
        if (err) {
          // Display error message
          console.error(err);
          var $error = $commentForm.find('#' + entryId + '-comment-error');
          $error.removeClass('hidden');
        } else {
          // Display success message
          var $success = $commentForm.find('#' + entryId + '-comment-success');
          $success.removeClass('hidden');
        }
      });
    });

    $els = [
      $openCommentForm,
      $cancel,
      $commentForm,
    ];
  };

  this.unbind = function () {
    // Unbind each child
    var k, v;
    for (k in _commentViewsMap) {
      if (_commentViewsMap.hasOwnProperty(k)) {
        v = _commentViewsMap[k];
        v.unbind();
      }
    }

    $els.forEach(function ($el) {
      $el.off();
    });
    $els = [];
  };
};
