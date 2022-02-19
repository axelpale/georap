/* eslint-disable max-statements */

// Form for comment creation and edit
var ui = require('georap-ui');
var emitter = require('component-emitter');
var MarkdownView = require('../../Markdown');
var AttachmentsForm = require('../../AttachmentsForm');
var template = require('./template.ejs');
var drafting = require('./drafting');
var __ = georap.i18n.__;

var MIN_LEN = georap.config.comments.minMessageLength;
var MAX_LEN = georap.config.comments.maxMessageLength;

module.exports = function (entry, comment) {
  // Parameters
  //   entry
  //     entry object
  //   comment
  //     optional comment object with complete attachments.
  //     Leave empty for comment creation.
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Short alias
  var entryId = entry._id;

  // Comment creation vs comment edit
  var isNew = false;
  if (!comment) {
    isNew = true;
    // Begin saving drafts until successful submit
    drafting.start(entryId);
    // Init with stored data or blank comment
    comment = drafting.load(entryId);
  }

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));

    // Setup message input
    $elems.markdown = $mount.find('.comment-form-markdown-container');
    children.markdown = new MarkdownView(comment.markdown, {
      label: isNew ? __('add-comment') + ':' : __('edit-comment') + ':',
      glyphicon: isNew ? 'glyphicon-comment' : 'glyphicon-pencil flip-x',
      placeholder: __('comment-placeholder'),
      rows: 3,
      minLength: MIN_LEN,
      maxLength: MAX_LEN,
    });
    children.markdown.bind($elems.markdown);
    // Focus to textarea and move cursor to message end
    setTimeout(function () {
      children.markdown.focus();
    }, 0);

    // Show attachment if any
    if (comment.attachments.length > 0) {
      self.openAttachmentsForm();
    }
  };

  self.openAttachmentsForm = function () {
    if ($mount && !children.attach) {
      $elems.attach = $mount.find('.comment-form-attachments-container');
      children.attach = new AttachmentsForm(comment.attachments, {
        label: __('photo-or-document') + ':',
        limit: 1,
      });
      children.attach.bind($elems.attach);
    }
  };

  self.getCommentData = function (opts) {
    // Return entryData object collected from the form.
    //
    // Parameters
    //   opts
    //     complete
    //       Set true to get complete attachments instead of keys.
    //       False by default.
    //
    if (!opts) {
      opts = {};
    }
    opts = Object.assign({
      complete: false,
    }, opts);

    if ($mount) {
      // Read message
      var markdown = children.markdown.getMarkdown();
      // Read attachments if available
      var attachments = [];
      if (children.attach) {
        if (opts.complete) {
          attachments = children.attach.getAttachments();
        } else {
          attachments = children.attach.getAttachmentKeys();
        }
      }

      return {
        markdown: markdown,
        attachments: attachments,
      };
    }
    return null;
  };

  self.discardDraft = function () {
    if ($mount) {
      drafting.stop(entryId);
    }
  };

  self.unbind = function () {
    if ($mount) {
      if (drafting.started(entryId)) {
        var draftData = self.getCommentData({ complete: true });
        drafting.save(entryId, draftData);
      }
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
