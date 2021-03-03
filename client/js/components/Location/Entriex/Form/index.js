// module EntryForm
//
// takes in an entry, blank or prefilled (edit)
//
// no submit cancel or delete buttons
//
// is able to create attachments
//
// temporary store of content for interrupted creation or edit
//
// either data export or submit method
//   submit target can adapt if given entry has id or not
//
// behavior can adapt if id or not
//
var template = require('./template.ejs');
var AttachmentsView = require('./Attachments');
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var account = tresdb.stores.account;

// Megabyte
var MB = 1024 * 1024;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     optional entry object. If not given, a blank entry form is shown.
  //
  if (!entry) {
    entry = {
      user: account.getName(),
      markdown: '',
      attachments: [],
    };
  }

  var self = this;
  emitter(self);

  var bound = {};
  var children = {};

  self.bind = function ($mount) {

    var isNew = !('_id' in entry);
    var isAuthor = account.isMe(entry.user);
    var isAdmin = account.isAdmin();
    var isAuthorOrAdmin = (isAuthor || isAdmin);

    if (!isAuthorOrAdmin) {
      // No form needed non-authors and non-admins
      return;
    }

    $mount.html(template({
      entry: entry,
      isAuthor: isAuthor,
      isNew: isNew,
      markdownSyntax: ui.markdownSyntax(),
      limit: Math.round(tresdb.config.uploadSizeLimit / MB),
    }));

    bound.syntaxOpen = $mount.find('.entry-syntax-open');
    bound.syntaxOpen.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($mount.find('.entry-syntax'));
    });

    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($mount.find('.form-attachments-container'));

    bound.cancelBtn = $mount.find('.entry-form-cancel');
    bound.cancelBtn.click(function () {
      self.emit('exit');
    });
  };

  self.unbind = function () {
    ui.offAll(bound);
    ui.unbindAll(children);
  };
};
