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

    var $commentsEl = $mount.find('#' + entryId + '-entry-comments');
    var $container = $mount.find('.entry-comment-form-container');
    var $commentForm = $mount.find('.entry-comment-form');
    var $commentProgress = $mount.find('#entry-comment-progress');
    var $entryFooter = $('#' + entryId + '-footer');
    var $error = $mount.find('#' + entryId + '-comment-error');
    var $messageInput = $mount.find('#' + entryId + '-comment-text-input');
    var $success = $mount.find('#' + entryId + '-comment-success');
    var $messageHint = $mount.find('#' + entryId + '-comment-hint');

    comments.forEach(function (comment) {
      var commentId = comment.id;
      var v = new CommentView(entry, comment);

      _commentViewsMap[commentId] = v;

      var commentEl = document.createElement('div');
      commentEl.id = 'comment-' + commentId;

      $commentsEl.append(commentEl);
      v.bind($(commentEl));
    });

    var $openCommentForm = $('#' + entryId + '-open-comment-form');
    $openCommentForm.click(function (ev) {
      ev.preventDefault();

      // Show the form container; Hide the footer
      $container.removeClass('hidden');
      $entryFooter.addClass('hidden');

      // Ensure visibility of the form inside the container.
      // Maybe hidden by previous success.
      $commentForm.removeClass('hidden');

      // Focus to message input
      $messageInput.focus();

      // Hide possible previous messages
      $success.addClass('hidden');
    });

    var $cancel = $mount.find('#' + entryId + '-comment-cancel-btn');
    $cancel.click(function (ev) {
      ev.preventDefault();

      // Hide the form container; Show the footer
      $container.addClass('hidden');
      $entryFooter.removeClass('hidden');
    });

    // Message hint
    // Validate message on comment input. Max length etc.
    var MIN_MESSAGE_LEN = 10;
    var MAX_MESSAGE_LEN = 600;
    $messageInput.on('input', function () {
      var msg = $messageInput.val();
      var len = msg.length;

      if (len === 0) {
        $messageHint.removeClass('text-danger');
        $messageHint.addClass('text-info');
        $messageHint.html('enter at least ' + MIN_MESSAGE_LEN + ' characters');
      } else if (len < MIN_MESSAGE_LEN) {
        $messageHint.removeClass('text-danger');
        $messageHint.addClass('text-info');
        $messageHint.html((MIN_MESSAGE_LEN - len) + ' more to go...');
      } else {
        $messageHint.html((MAX_MESSAGE_LEN - len) + ' characters left');
        if (len > MAX_MESSAGE_LEN) {
          $messageHint.addClass('text-danger');
          $messageHint.removeClass('text-info');
        } else {
          $messageHint.removeClass('text-danger');
          $messageHint.addClass('text-info');
        }
      }
    });

    $commentForm.submit(function (ev) {
      ev.preventDefault();

      var message = $messageInput.val();
      var len = message.length;

      if (len < MIN_MESSAGE_LEN || len > MAX_MESSAGE_LEN) {
        // Do not submit. Emphasize message hint.
        $messageHint.addClass('text-danger');
        $messageHint.removeClass('text-info');
        return;
      }

      // Hide form but not container.
      $commentForm.addClass('hidden');
      $commentProgress.removeClass('hidden');
      // Hide possible previous messages
      $error.addClass('hidden');

      entry.createComment(message, function (err) {
        if (err) {
          // Show form
          $commentForm.removeClass('hidden');
          // Hide progress
          $commentProgress.addClass('hidden');
          // Display error message
          $error.removeClass('hidden');
          $error.html(err.message);
        } else {
          // Hide progress
          $commentProgress.addClass('hidden');
          // Display success message
          $success.removeClass('hidden');
          // Show entry footer
          $entryFooter.removeClass('hidden');
          // Empty the successfully posted message
          $messageInput.val('');
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
