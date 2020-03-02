/* eslint-disable max-statements */
var template = require('./template.ejs');
var account = require('../../../../../stores/account');
var CommentView = require('./Comment');
var PendingCommentView = require('./PendingComment');
var updateHint = require('./updateHint');

var commentsConfig = require('./config');
var MIN_MESSAGE_LEN = commentsConfig.MIN_MESSAGE_LEN;
var MAX_MESSAGE_LEN = commentsConfig.MAX_MESSAGE_LEN;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var _commentViewsMap = {};
  var _pendingCommentViews = {};
  var $els = [];
  var entryId = entry.getId();

  // Helper methods

  var generateComment = function (comment) {
    var commentId = comment.id;
    var v = new CommentView(entry, comment);

    _commentViewsMap[commentId] = v;

    var commentEl = document.createElement('div');
    commentEl.id = 'comment-' + commentId;

    var $commentEl = $(commentEl);
    v.bind($commentEl);

    return $commentEl;
  };

  // Public methods

  this.bind = function ($mount) {
    var comments = entry.getComments();

    $mount.html(template({
      entryId: entryId,
      MIN_LEN: MIN_MESSAGE_LEN,
    }));

    var $commentsEl = $mount.find('#entry-' + entryId + '-comments');
    var $container = $mount.find('.entry-comment-form-container');
    var $commentForm = $mount.find('.entry-comment-form');
    var $commentProgress = $mount.find('#entry-comment-progress');
    var $entryFooter = $('#entry-' + entryId + '-footer');
    var $error = $mount.find('#entry-' + entryId + '-comment-error');
    var $messageInput = $mount.find('#entry-' + entryId + '-comment-input');
    var $success = $mount.find('#entry-' + entryId + '-comment-success');
    var $messageHint = $mount.find('#entry-' + entryId + '-comment-hint');
    var $openCommentForm = $('#entry-' + entryId + '-open-comment-form');
    var $cancel = $mount.find('#entry-' + entryId + '-comment-cancel-btn');

    comments.forEach(function (comment) {
      var $commentEl = generateComment(comment);
      $commentsEl.append($commentEl);
    });

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

      // Hide possible previous infos
      $success.addClass('hidden');

      // Update possibly previously changed hint
      var len = $messageInput.val().length;
      updateHint($messageHint, len);
    });

    $cancel.click(function (ev) {
      ev.preventDefault();

      // Hide the form container; Show the footer
      $container.addClass('hidden');
      $entryFooter.removeClass('hidden');
    });

    // Message hint
    // Validate message on comment input. Max length etc.
    $messageInput.on('input', function () {
      var msg = $messageInput.val();
      var len = msg.length;

      updateHint($messageHint, len);
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
          // Success //
          // Hide progress
          $commentProgress.addClass('hidden');
          // Show entry footer
          $entryFooter.removeClass('hidden');
          // Hide form container but reveal the form for next comment.
          $container.addClass('hidden');
          $commentForm.removeClass('hidden');
          // Empty the successfully posted message input
          $messageInput.val('');
          // Generate a pending comment
          var tempId = Math.random().toString().substr(2);
          var tempComment = {
            tempId: tempId,
            user: account.getName(),
            message: message,
          };
          // Check if the comment has been created via events already.
          // This can happen when server emits the event before response.
          var foundComment = entry.getComments().find(function (comment) {
            var sameUser = tempComment.user === comment.user;
            var sameContent = tempComment.message === comment.message;
            var commentTime = new Date(comment.time);
            var ageMs = Date.now() - commentTime.getTime();
            var minute = 60000;
            return sameUser && sameContent && ageMs < minute;
          });
          // If the comment is not already received, create a pending comment.
          if (typeof foundComment === 'undefined') {
            var pcv = new PendingCommentView(entry, tempComment);
            _pendingCommentViews[tempId] = pcv;
            var pendingCommentEl = document.createElement('div');
            pendingCommentEl.id = 'pending-comment-' + tempId;
            $commentsEl.append(pendingCommentEl);
            pcv.bind($(pendingCommentEl));
          }
        }
      });
    });

    entry.on('location_entry_comment_created', function (ev) {
      // Construct comment struct
      var comment = {
        id: ev.data.commentId,
        user: ev.user,
        time: ev.time,
        message: ev.data.message,
      };
      // Find if there is replaceable comment elements
      var replaceKey = Object.keys(_pendingCommentViews).find(function (key) {
        var pcv = _pendingCommentViews[key];
        var sameUser = pcv.comment.user === comment.user;
        var sameContent = pcv.comment.message === comment.message;
        return sameUser && sameContent;
      });
      if (replaceKey) {
        // Replace the pending comment with the real thing.
        var replaceable = _pendingCommentViews[replaceKey];
        var tempId = replaceable.comment.tempId;
        var $tempEl = $commentsEl.find('#pending-comment-' + tempId);
        // Create the real thing.
        var $newCommentEl = generateComment(comment);
        $tempEl.replaceWith($newCommentEl);
        // Clean up
        _pendingCommentViews[tempId].unbind();
        delete _pendingCommentViews[tempId];
      } else {
        // There is no replaceable element.
        // Either the comment is made by another user or
        // from another client or the pending comment has not yet been created.
        // Append to the list of comments.
        var $commentEl = generateComment(comment);
        $commentsEl.append($commentEl);
        // Flash in green; Override list item styles.
        var DURATION = 2;
        var DELAY = 2;
        var SECOND = 1000;
        var $listItem = $commentEl.find('.list-group-item');
        $listItem.css('background-color', '#dff0d8');
        $listItem.css('transition', 'background-color ' + DURATION + 's');
        window.setTimeout(function () {
          $listItem.css('background-color', 'white');
        }, DELAY * SECOND);
        window.setTimeout(function () {
          $listItem.css('transition', 'unset');
        }, (DURATION + DELAY) * SECOND);
      }
    });

    entry.on('location_entry_comment_changed', function (ev) {
      // Shortcut id
      var commentId = ev.data.commentId;
      // Find comment in the _commentViewsMap
      var cv = _commentViewsMap[commentId];
      // Update message
      cv.comment.message = ev.data.newMessage;
      // Find element
      var elemId = 'comment-' + commentId;
      var $messageEl = $mount.find('#' + elemId + ' span.comment-message');
      // Update message element (if exists)
      $messageEl.html(ev.data.newMessage);
    });

    entry.on('location_entry_comment_removed', function (ev) {
      // Shortcut id
      var commentId = ev.data.commentId;
      // Find comment in the _commentViewsMap
      var cv = _commentViewsMap[commentId];
      if (cv) {
        // Remove comment view component.
        cv.unbind();
        delete _commentViewsMap[commentId];
      }
      // Find element
      var elemId = 'comment-' + commentId;
      var $commentEl = $mount.find('#' + elemId);
      if ($commentEl.length !== 0) {
        // Remove element if exists.
        $commentEl.remove();
      }
    });

    $els = [
      $openCommentForm,
      $cancel,
      $commentForm,
      $messageInput,
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

    for (k in _pendingCommentViews) {
      if (_pendingCommentViews.hasOwnProperty(k)) {
        _pendingCommentViews[k].unbind();
      }
    }

    $els.forEach(function ($el) {
      $el.off();
    });
    $els = [];

    entry.off('location_entry_comment_created');
  };
};
