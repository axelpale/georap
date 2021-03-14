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

    $elems.saveBtn = $mount.find('.entry-form-save');
    $elems.saveBtn.click(function () {
      // Create new entry or update the existing

      var entryData = {
        markdown: children.markdown.getMarkdown(),
        attachments: children.attachments.getAttachmentKeys(),
        flags: [], // TODO children.flags.getFlags(),
      };

      if (isNew) {
        entries.create(location._id, entryData, function (err) {
          if (err) {
            // TODO show submit error
            return console.log(err);
          }
          self.emit('success');
        });
      } else {
        entries.change(location._id, entry._id, entryData, function (err) {
          if (err) {
            // TODO
            return console.log(err);
          }
          self.emit('success');
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
