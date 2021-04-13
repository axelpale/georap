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
var ErrorView = require('../Error');
var RemoveView = require('../Remove');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var entries = tresdb.stores.entries;

module.exports = function (locationId, entry) {
  // Entry form View.
  //
  // Parameters:
  //   locationId
  //     location id string
  //   entry
  //     optional entry object. If not given, a blank entry form is shown.
  //
  if (!entry) {
    entry = {
      markdown: '',
      attachments: [],
      flags: [],
    };
  }

  var self = this;
  emitter(self);

  var $mount = null;
  var $elems = {};
  var children = {};

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var isNew = !('_id' in entry);

    $mount.html(template({
      entry: entry,
      isNew: isNew,
    }));

    children.markdown = new MarkdownView(entry.markdown, {
      label: 'Tell something about the location:',
      rows: 3,
    });
    children.markdown.bind($mount.find('.form-markdown-container'));

    children.attachments = new AttachmentsForm(entry.attachments, {
      label: 'Photos and attachments:',
    });
    children.attachments.bind($mount.find('.form-attachments-container'));

    children.error = new ErrorView();
    children.error.bind($mount.find('.form-error-container'));

    $elems.progress = $mount.find('.form-progress');

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
        return onError('Empty posts are not allowed.');
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

    // Focus to text input
    children.markdown.focus();

    $elems.cancelBtn = $mount.find('.entry-form-cancel');
    $elems.cancelBtn.click(function () {
      self.emit('exit');
    });

    if (!isNew) {
      children.remove = new RemoveView({
        label: 'Delete post...',
      });
      children.remove.bind($mount.find('.form-remove-container'));
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

    if ($mount) {
      var attachments;
      if (opts.complete) {
        attachments = children.attachments.getAttachments();
      } else {
        attachments = children.attachments.getAttachmentKeys();
      }

      return {
        markdown: children.markdown.getMarkdown().trim(),
        attachments: attachments,
        flags: [], // TODO children.flags.getFlags(),
      };
    }
    return null;
  };

  self.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      ui.unbindAll(children);
      $mount = null;
    }
  };
};
