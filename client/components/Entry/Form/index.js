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
var AttachmentsForm = require('../AttachmentsForm');
var MarkdownView = require('../Markdown');
var FlagsForm = require('../FlagsForm');
var ErrorView = require('../Error');
var RemoveForm = require('../Remove');
var MoveForm = require('../MoveForm');
var drafting = require('./drafting');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var entries = georap.stores.entries;
var __ = georap.i18n.__;

module.exports = function (locationId, entry) {
  // Entry form View.
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

    // Error
    children.error = new ErrorView();
    children.error.bind($mount.find('.form-error-container'));
    // Progress bar
    $elems.progress = $mount.find('.form-progress');

    // Save button
    $elems.saveBtn = $mount.find('.entry-form-save');
    $elems.saveBtn.click(function () {
      // Create new entry or update the existing

      // Prevent double click
      $elems.saveBtn.attr('disabled', 'disabled');

      var entryData = self.getEntryData();

      var onError = function (msg) {
        // Hide progress bar
        ui.hide($elems.progress);
        // Show alert
        children.error.update(msg);
        // Enable save
        $elems.saveBtn.removeAttr('disabled');
      };

      var onSuccess = function () {
        // Hide progress bar
        ui.hide($elems.progress);
        // Inform parents
        self.emit('success');
      };

      // Ensure non-empty content
      if (entryData.markdown.length + entryData.attachments.length === 0) {
        return onError(__('empty-post-error'));
      }

      // Display progress bar
      ui.show($elems.progress);

      if (isNew) {
        entries.create(locationId, entryData, function (err) {
          if (err) {
            if (!err.message) {
              return onError('Failed to send. Check connection.');
            }
            return onError(err.message);
          }
          // End drafting and clear stored draft.
          // Do it here instead of onSuccess handler to prevent
          // an entry edit clearing the new draft.
          drafting.stop(locationId);
          // Stuff to do after either creation or change
          onSuccess();
        });
      } else {
        entries.change(locationId, entry._id, entryData, function (err) {
          if (err) {
            if (!err.message) {
              return onError('Failed to save. Check connection.');
            }
            return onError(err.message);
          }
          onSuccess();
        });
      }
    });

    $elems.cancelBtn = $mount.find('.entry-form-cancel');
    $elems.cancelBtn.click(function () {
      self.emit('exit');
    });

    if (!isNew) {
      $elems.removeOpen = $mount.find('.entry-remove-open');
      $elems.remove = $mount.find('.entry-remove-container');
      $elems.moveOpen = $mount.find('.entry-move-open');
      $elems.move = $mount.find('.entry-move-container');

      var pauseMs = 500;
      $elems.removeOpen.click(ui.throttle(pauseMs, function () {
        ui.toggleHidden($elems.remove);
      }));
      $elems.moveOpen.click(ui.throttle(pauseMs, function () {
        ui.toggleHidden($elems.move);
      }));

      // Remove entry
      children.remove = new RemoveForm({
        info: __('post-removal-info'),
      });
      children.remove.bind($elems.remove);
      children.remove.on('submit', function () {
        entries.remove(entry.locationId, entry._id, function (err) {
          if (err) {
            children.remove.reset(); // hide progress and confirmation
            children.error.update(err.message);
            return;
          }

          // Success. The server will emit location_entry_removed
          self.emit('exit');
        });
      });

      // Move entry
      children.move = new MoveForm(entry);
      children.move.bind($elems.move);

      // Hide on cancel
      children.remove.on('exit', function () {
        ui.hide($elems.remove);
      });
      children.move.on('exit', function () {
        ui.hide($elems.move);
      });
    }
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
