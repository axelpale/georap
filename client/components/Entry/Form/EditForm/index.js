/* eslint-disable max-statements */
// module EntryForm
//
// Features
// - use same form for entry creation and edit.
// - handles the API calls internally
// - is able to upload attachments
// - temporary store of content for interrupted creation or edit
//
var template = require('./template.ejs');
var AttachmentsForm = require('../../AttachmentsForm');
var MarkdownView = require('../../Markdown');
var FlagsForm = require('../../FlagsForm');
var drafting = require('./drafting');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var __ = georap.i18n.__;

module.exports = function (locationId, entry) {
  // Form for Entry editing.
  //
  // Parameters:
  //   locationId
  //     location id string
  //   entry
  //     optional entry object. If not given, a blank entry form is shown.
  //
  var isNew = false;
  if (!entry) {
    isNew = true;
    // Init with empty entry or previously saved draft.
    drafting.start(locationId);
    entry = drafting.load(locationId);
  }

  var $mount = null;
  var $elems = {};
  var children = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entry: entry,
      isNew: isNew,
      __: __,
    }));

    // Markdown form
    children.markdown = new MarkdownView(entry.markdown, {
      label: __('tell-about-location') + ':',
      rows: 5,
    });
    children.markdown.bind($mount.find('.form-markdown-container'));
    // Focus to textarea and move cursor to message end
    setTimeout(function () {
      children.markdown.focus();
    }, 0);

    // Attachments form
    children.attachments = new AttachmentsForm(entry.attachments, {
      label: __('photos-and-documents') + ':',
    });
    children.attachments.bind($mount.find('.form-attachments-container'));

    // Flags form
    children.flags = new FlagsForm(entry.flags);
    children.flags.bind($mount.find('.form-flags-container'));
  };

  self.discardDraft = function () {
    // Delete any save draft. Useful after successful entry creation.
    drafting.stop(locationId);
  };

  self.getEntryData = function (opts) {
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
      var attachments;
      if (opts.complete) {
        attachments = children.attachments.getAttachments();
      } else {
        attachments = children.attachments.getAttachmentKeys();
      }

      return {
        markdown: children.markdown.getMarkdown(),
        attachments: attachments,
        flags: children.flags.getFlags(),
      };
    }
    return null;
  };

  self.unbind = function () {
    if ($mount) {
      // Save draft if allowed
      if (drafting.started(locationId) && isNew) {
        var draftData = self.getEntryData({ complete: true });
        drafting.save(locationId, draftData);
      }
      // Then unbind
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
      $mount = null;
    }
  };
};
