var template = require('./template.ejs');
var entryModel = require('tresdb-models').entry;
var CommentsView = require('./Comments');
var FormView = require('../Form');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.
  //

  var children = {};

  var isAuthor = account.isMe(entry.user);
  var isAdmin = account.isAdmin();
  var isAuthorOrAdmin = (isAuthor || isAdmin);

  this.bind = function ($mount) {
    $mount.html(template({
      entryId: entry._id,
      username: entry.user,
      isAuthorOrAdmin: isAuthorOrAdmin,
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      hasMarkdown: entryModel.hasMarkdown(entry),
      markdownHtml: ui.markdownToHtml(entry.markdown),
      images: entryModel.getImages(entry),
      nonImages: entryModel.getNonImages(entry),
    }));

    children.comments = new CommentsView(entry);
    children.comments.bind($mount.find('.entry-comments-container'));

    if (isAuthorOrAdmin) {
      children.editform = new FormView(entry);
      children.editform.bind($mount.find('.entry-form-container'));

      $mount.find('.entry-form-open').click(function () {
        ui.toggleHidden($mount.find('.entry-form-container'));
      });
    }
  };

  this.unbind = function () {
    Object.keys(children).forEach(function (k) {
      children[k].unbind();
    });
  };
};
