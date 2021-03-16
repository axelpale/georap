var template = require('./template.ejs');
var entryModel = require('tresdb-models').entry;
var AttachmentsView = require('./Attachments');
var CommentsView = require('./Comments');
var FormView = require('../Form');
var FormAdminView = require('../FormAdmin');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (location, entry) {
  // Parameters:
  //   location
  //     location object
  //   entry
  //     entry object
  //

  var $mount = null;
  var listeners = {};
  var children = {};

  var isAuthor = account.isMe(entry.user);
  var isAdmin = account.isAdmin();
  var isAuthorOrAdmin = (isAuthor || isAdmin);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entryId: entry._id,
      username: entry.user,
      isAuthorOrAdmin: isAuthorOrAdmin,
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      hasMarkdown: entryModel.hasMarkdown(entry),
      markdownHtml: ui.markdownToHtml(entry.markdown),
    }));

    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($mount.find('.entry-attachments-container'));

    children.comments = new CommentsView(entry);
    children.comments.bind($mount.find('.entry-comments-container'));

    if (isAuthorOrAdmin) {
      listeners.openBtn = $mount.find('.entry-form-open');
      listeners.openBtn.click(function () {
        var $formContainer = $mount.find('.entry-form-container');
        if (ui.isHidden($formContainer)) {
          ui.show($formContainer);

          if (isAuthor) {
            children.editform = new FormView(location, entry);
            children.editform.bind($formContainer);
          } else {
            // The user is non-author admin. Show reduced form.
            children.editform = new FormAdminView(location, entry);
            children.editform.bind($formContainer);
          }

          children.editform.once('exit', function () {
            ui.hide($formContainer);
            children.editform.unbind();
            delete children.editform;
          });
        } else {
          ui.hide($formContainer);
          children.editform.unbind();
          children.editform.off(); // for once
          delete children.editform;
        }
      });
    }
  };

  this.update = function (ev) {
    if ($mount) {
      entryModel.forward(entry, ev);
      this.unbind();
      this.bind($mount);
    }
  };

  this.unbind = function () {
    ui.offAll(listeners);
    ui.unbindAll(children);
  };
};
