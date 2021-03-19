// module EntryForm
//
// Features
// - use same form for entry creation and edit.
// - handles the API calls internally
// - is able to upload attachments
// - temporary store of content for interrupted creation or edit
//
var template = require('./template.ejs');
var AttachmentsView = require('./Attachments');
var MarkdownView = require('./Markdown');
var ErrorView = require('./Error');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var account = tresdb.stores.account;
var entries = tresdb.stores.entries;

module.exports = function (location, entry) {
  // Entry form View.
  //
  // Parameters:
  //   location
  //     location object
  //   entry
  //     optional entry object. If not given, a blank entry form is shown.
  //
  if (!entry) {
    entry = {
      user: account.getName(),
      markdown: '',
      attachments: [],
      flags: [],
    };
  }

  var self = this;
  emitter(self);

  var $elems = {};
  var children = {};

  self.bind = function ($mount) {

    var isNew = !('_id' in entry);

    $mount.html(template({
      entry: entry,
      isNew: isNew,
    }));

    children.markdown = new MarkdownView(location, entry);
    children.markdown.bind($mount.find('.form-markdown-container'));

    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($mount.find('.form-attachments-container'));

    children.error = new ErrorView();
    children.error.bind($mount.find('.form-error-container'));

    $elems.progress = $mount.find('.form-progress');

    $elems.saveBtn = $mount.find('.entry-form-save');
    $elems.saveBtn.click(function () {
      // Create new entry or update the existing

      // Prevent double click
      $elems.saveBtn.attr('disabled', 'disabled');

      var entryData = {
        markdown: children.markdown.getMarkdown().trim(),
        attachments: children.attachments.getAttachmentKeys(),
        flags: [], // TODO children.flags.getFlags(),
      };

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
        entries.create(location._id, entryData, function (err) {
          if (err) {
            return onError(err.message);
          }
          onSuccess();
        });
      } else {
        entries.change(location._id, entry._id, entryData, function (err) {
          if (err) {
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

    // Focus
    children.markdown.focus();
  };

  self.unbind = function () {
    ui.offAll($elems);
    ui.unbindAll(children);
  };
};
